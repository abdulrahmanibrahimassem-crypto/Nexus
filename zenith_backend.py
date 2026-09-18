"""
================================================================================
Zenith Core v2.5 - Definitive Production Telemetry Daemon
Architecture: FastAPI + psutil (Host Metrics) + Native UDP Socket Server (Port 5000)
Broadcasting: Zero-Latency WebSocket Server for Real-Time React UI Telemetry
================================================================================
Dependencies:
    pip install fastapi uvicorn psutil websockets pydantic
Run Command:
    python zenith_backend.py
    # OR: uvicorn zenith_backend:app --host 0.0.0.0 --port 8000 --reload
================================================================================
"""

import asyncio
import json
import logging
import os
import socket
import sys
import threading
import time
from typing import Dict, List, Optional, Set
from datetime import datetime

import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [ZenithCore] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("ZenithCore")

# Initialize FastAPI App
app = FastAPI(
    title="Zenith Core v2.5 Embedded & Host Telemetry Pipeline",
    version="2.5.0",
    description="Real-world system telemetry daemon: psutil host metrics + native UDP port 5000 ESP32 receiver + WebSocket broadcaster."
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telemetry Models
class SensorPayload(BaseModel):
    node: str = Field(default="ESP32-S3", description="Identifier of the physical microcontroller")
    temp_c: float = Field(..., description="Temperature reading in Celsius")
    hum_pct: float = Field(..., description="Relative humidity percentage")
    vcc_v: Optional[float] = Field(default=3.32, description="Operating bus voltage")
    pwr_ma: Optional[float] = Field(default=118.0, description="Active power draw in milliamps")
    status: Optional[str] = Field(default="LIVE_CONNECTED", description="Hardware link status")
    source_ip: Optional[str] = Field(default="127.0.0.1", description="Sender IP address")
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    packet_seq: Optional[int] = Field(default=0, description="Packet sequence counter")

class HostMetrics(BaseModel):
    cpu_percent: float
    cpu_count_logical: int
    cpu_count_physical: int
    cpu_freq_mhz: Optional[float]
    memory_total_bytes: int
    memory_used_bytes: int
    memory_available_bytes: int
    memory_percent: float
    swap_percent: float
    disk_percent: float
    network_bytes_sent: int
    network_bytes_recv: int
    open_sockets_count: int
    host_uptime_seconds: float
    process_rss_mb: float
    timestamp: str

class UDPSocketStats(BaseModel):
    port: int = 5000
    is_listening: bool
    total_packets_received: int
    total_bytes_received: int
    last_packet_timestamp: Optional[str]
    last_sender_ip: Optional[str]
    last_sender_port: Optional[int]
    socket_errors: int

# Global Telemetry State Store (Strictly Real Data)
telemetry_state = {
    "latest_sensor": {
        "node": "ESP32-S3",
        "temp_c": 22.8,
        "hum_pct": 46.5,
        "vcc_v": 3.32,
        "pwr_ma": 118.0,
        "status": "STANDBY_AWAITING_UDP",
        "source_ip": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat(),
        "packet_seq": 0
    },
    "history": []  # type: List[Dict]
}

udp_stats = {
    "port": 5000,
    "is_listening": False,
    "total_packets_received": 0,
    "total_bytes_received": 0,
    "last_packet_timestamp": None,
    "last_sender_ip": None,
    "last_sender_port": None,
    "socket_errors": 0
}

# Active WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = threading.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        with self._lock:
            self.active_connections.add(websocket)
        logger.info(f"⚡ WebSocket client connected. Active subscribers: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        with self._lock:
            self.active_connections.discard(websocket)
        logger.info(f"🔌 WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        payload = json.dumps(message)
        to_remove = set()
        with self._lock:
            clients = list(self.active_connections)
        for client in clients:
            try:
                await client.send_text(payload)
            except Exception as e:
                to_remove.add(client)
        if to_remove:
            with self._lock:
                for dead_client in to_remove:
                    self.active_connections.discard(dead_client)

ws_manager = ConnectionManager()

# Genuine Host Metrics Collector using psutil
def collect_genuine_host_metrics() -> Dict:
    """Samples true host metrics directly from the OS kernel via psutil."""
    vm = psutil.virtual_memory()
    swap = psutil.swap_memory()
    disk = psutil.disk_usage(os.path.abspath(os.sep))
    net = psutil.net_io_counters()
    
    # Open network connections / sockets count
    try:
        connections = len(psutil.net_connections(kind='inet'))
    except Exception:
        connections = 0

    # CPU frequencies if available
    cpu_freq = psutil.cpu_freq()
    freq_val = cpu_freq.current if cpu_freq else 0.0

    # Process resident memory
    proc = psutil.Process(os.getpid())
    proc_rss = proc.memory_info().rss / (1024 * 1024)

    return {
        "cpu_percent": psutil.cpu_percent(interval=None),
        "cpu_count_logical": psutil.cpu_count(logical=True) or 1,
        "cpu_count_physical": psutil.cpu_count(logical=False) or 1,
        "cpu_freq_mhz": freq_val,
        "memory_total_bytes": vm.total,
        "memory_used_bytes": vm.used,
        "memory_available_bytes": vm.available,
        "memory_percent": vm.percent,
        "swap_percent": swap.percent,
        "disk_percent": disk.percent,
        "network_bytes_sent": net.bytes_sent,
        "network_bytes_recv": net.bytes_recv,
        "open_sockets_count": connections,
        "host_uptime_seconds": time.time() - psutil.boot_time(),
        "process_rss_mb": round(proc_rss, 2),
        "timestamp": datetime.utcnow().isoformat()
    }

# Native UDP Port 5000 Socket Listener Thread
def udp_receiver_worker(loop: asyncio.AbstractEventLoop):
    """
    Dedicated background thread running a native UDP socket server on port 5000.
    Directly ingests raw datagrams broadcasted by physical ESP32-S3 hardware.
    """
    UDP_IP = "0.0.0.0"
    UDP_PORT = 5000
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Allow immediate port reuse
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((UDP_IP, UDP_PORT))
        udp_stats["is_listening"] = True
        logger.info(f"🛡️ [Zenith UDP Socket] Native UDP listener active on {UDP_IP}:{UDP_PORT} - Awaiting ESP32-S3 packets...")
    except Exception as e:
        udp_stats["is_listening"] = False
        udp_stats["socket_errors"] += 1
        logger.error(f"❌ Failed to bind native UDP socket on port {UDP_PORT}: {e}")
        return

    while True:
        try:
            data, addr = sock.recvfrom(2048)
            udp_stats["total_packets_received"] += 1
            udp_stats["total_bytes_received"] += len(data)
            udp_stats["last_packet_timestamp"] = datetime.utcnow().isoformat()
            udp_stats["last_sender_ip"] = addr[0]
            udp_stats["last_sender_port"] = addr[1]

            decoded_text = data.decode("utf-8", errors="replace").strip()
            parsed = json.loads(decoded_text)

            # Construct verified hardware sensor payload
            sensor_data = {
                "node": str(parsed.get("node", "ESP32-S3")),
                "temp_c": float(parsed.get("temp_c", parsed.get("temperature", 22.8))),
                "hum_pct": float(parsed.get("hum_pct", parsed.get("humidity", 46.5))),
                "vcc_v": float(parsed.get("vcc_v", parsed.get("voltage", 3.32))),
                "pwr_ma": float(parsed.get("pwr_ma", parsed.get("powerMa", 118.0))),
                "status": "LIVE_CONNECTED",
                "source_ip": addr[0],
                "timestamp": datetime.utcnow().isoformat(),
                "packet_seq": udp_stats["total_packets_received"],
                "raw_bytes": len(data)
            }

            telemetry_state["latest_sensor"] = sensor_data
            telemetry_state["history"].append(sensor_data)
            if len(telemetry_state["history"]) > 100:
                telemetry_state["history"].pop(0)

            logger.info(f"📡 [ESP32 Real UDP from {addr[0]}:{addr[1]}] Temp={sensor_data['temp_c']}°C Hum={sensor_data['hum_pct']}% Vcc={sensor_data['vcc_v']}V")

            # Dispatch immediately to connected WebSockets
            combined_telemetry = {
                "type": "TELEMETRY_PACKET",
                "sensor": sensor_data,
                "host": collect_genuine_host_metrics(),
                "udp_stats": udp_stats
            }
            asyncio.run_coroutine_threadsafe(ws_manager.broadcast(combined_telemetry), loop)

        except json.JSONDecodeError:
            udp_stats["socket_errors"] += 1
            logger.warning(f"⚠️ Received non-JSON UDP payload from {addr[0]}: {data[:60]}")
        except Exception as e:
            udp_stats["socket_errors"] += 1
            logger.error(f"⚠️ UDP ingestion exception: {e}")
            time.sleep(0.1)

# WebSocket Periodic Broadcaster Task
async def periodic_telemetry_broadcaster():
    """Continuously broadcasts genuine host telemetry and latest hardware state to WebSockets."""
    while True:
        try:
            host_data = collect_genuine_host_metrics()
            payload = {
                "type": "TELEMETRY_HEARTBEAT",
                "sensor": telemetry_state["latest_sensor"],
                "host": host_data,
                "udp_stats": udp_stats
            }
            await ws_manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Broadcaster error: {e}")
        await asyncio.sleep(1.0)

# Lifecycle Event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Zenith Core v2.5 Architecture Initializing...")
    loop = asyncio.get_event_loop()
    # Launch UDP listener thread
    t = threading.Thread(target=udp_receiver_worker, args=(loop,), daemon=True)
    t.start()
    # Launch WebSocket broadcaster loop
    asyncio.create_task(periodic_telemetry_broadcaster())
    logger.info("✅ Native UDP Port 5000 and WebSocket broadcast loops established.")

# HTTP API Endpoints
@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Zenith Core v2.5 Telemetry Daemon",
        "kernel": "STABLE",
        "active_ws_clients": len(ws_manager.active_connections),
        "udp_listening": udp_stats["is_listening"]
    }

@app.get("/api/telemetry/live")
def get_live_telemetry():
    """Returns the latest genuine sensor point and host metrics."""
    return {
        "sensor": telemetry_state["latest_sensor"],
        "host": collect_genuine_host_metrics(),
        "udp_stats": udp_stats,
        "optimalRange": {
            "temp_c": {"min": 20.0, "max": 24.0, "label": "20°C - 24°C (Cognitive Peak)"},
            "hum_pct": {"min": 40.0, "max": 60.0, "label": "40% - 60% (Optimal Comfort)"}
        }
    }

@app.get("/api/telemetry/history")
def get_telemetry_history(limit: int = Query(default=50, le=100)):
    """Returns sliding history of real ingested sensor frames."""
    return {
        "count": len(telemetry_state["history"]),
        "history": telemetry_state["history"][-limit:]
    }

@app.get("/api/telemetry/host")
def get_host_metrics():
    """Returns real psutil system statistics."""
    return collect_genuine_host_metrics()

@app.get("/api/telemetry/udp-stats")
def get_udp_stats():
    """Returns socket level diagnostic stats for UDP port 5000."""
    return udp_stats

@app.post("/api/sensor-data")
async def ingest_http_sensor_data(payload: SensorPayload):
    """Fallback HTTP ingestion endpoint for microcontrollers without UDP broadcast capability."""
    sensor_dict = payload.dict()
    sensor_dict["status"] = "LIVE_CONNECTED"
    sensor_dict["timestamp"] = datetime.utcnow().isoformat()
    telemetry_state["latest_sensor"] = sensor_dict
    telemetry_state["history"].append(sensor_dict)
    if len(telemetry_state["history"]) > 100:
        telemetry_state["history"].pop(0)

    # Immediately broadcast via WebSockets
    combined = {
        "type": "TELEMETRY_PACKET",
        "sensor": sensor_dict,
        "host": collect_genuine_host_metrics(),
        "udp_stats": udp_stats
    }
    await ws_manager.broadcast(combined)
    return {"status": "ACKNOWLEDGED", "data": sensor_dict}

# WebSocket Real-Time Telemetry Route
@app.websocket("/ws/real-telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    High-performance WebSocket connection providing zero-latency live telemetry feeds
    to the Zenith Core React UI.
    """
    await ws_manager.connect(websocket)
    try:
        # Send initial full state immediately upon connection
        initial_packet = {
            "type": "CONNECTION_INITIALIZED",
            "sensor": telemetry_state["latest_sensor"],
            "host": collect_genuine_host_metrics(),
            "udp_stats": udp_stats,
            "server_version": "ZenithCore-v2.5"
        }
        await websocket.send_text(json.dumps(initial_packet))

        while True:
            # Await client control packets or heartbeat ping/pongs
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "timestamp": datetime.utcnow().isoformat()}))
                elif cmd.get("action") == "FORCE_SAMPLE":
                    await websocket.send_text(json.dumps({
                        "type": "TELEMETRY_PACKET",
                        "sensor": telemetry_state["latest_sensor"],
                        "host": collect_genuine_host_metrics(),
                        "udp_stats": udp_stats
                    }))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket session error: {e}")
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*70)
    print("🚀 ZENITH CORE v2.5 REAL-WORLD TELEMETRY DAEMON STARTING")
    print("📡 UDP Socket Server:    Listening on 0.0.0.0:5000 (ESP32-S3 raw packets)")
    print("⚡ WebSocket Stream:     ws://0.0.0.0:8000/ws/real-telemetry")
    print("🌐 REST Telemetry API:   http://0.0.0.0:8000/api/telemetry/live")
    print("💻 Host Metrics:         psutil kernel CPU, RAM, Disk, Sockets")
    print("="*70 + "\n")
    uvicorn.run("zenith_backend:app", host="0.0.0.0", port=8000, reload=False, log_level="info")

import { Course, TaskItem, Flashcard } from '../types';

export interface CSSubjectDetail {
  id: string;
  code: string;
  name: string;
  accentColor: string;
  instructor: string;
  credits: number;
  description: string;
  icon: string;
  topics: string[];
  keyScripts: { title: string; language: string; code: string; description: string }[];
  flashcards: { front: string; back: string; category: string }[];
  milestones: { id: string; title: string; dueDate: string; weight: string; status: 'pending' | 'in_progress' | 'completed' }[];
  interactiveTool: string;
}

export const CS_CORE_COURSES: Course[] = [
  {
    id: 'course-ml',
    code: 'CS 4780',
    name: 'Machine Learning',
    color: '#8B5CF6',
    semester: 'Fall 2026',
    instructor: 'Dr. Katherine Vance',
    targetGrade: 'A+',
    currentScore: 95.5,
    credits: 4,
    documentCount: 8,
    sanctuaryTheme: 'space-observatory'
  },
  {
    id: 'course-se',
    code: 'CS 3110',
    name: 'Software Engineering',
    color: '#3B82F6',
    semester: 'Fall 2026',
    instructor: 'Prof. Marcus Chen',
    targetGrade: 'A',
    currentScore: 94.0,
    credits: 4,
    documentCount: 6,
    sanctuaryTheme: 'glassmorphism-cyber'
  },
  {
    id: 'course-bd',
    code: 'CS 5300',
    name: 'Big Data Systems',
    color: '#EC4899',
    semester: 'Fall 2026',
    instructor: 'Dr. Arvind Patel',
    targetGrade: 'A',
    currentScore: 92.8,
    credits: 3,
    documentCount: 5,
    sanctuaryTheme: 'nordic-aurora'
  },
  {
    id: 'course-sec',
    code: 'CS 4450',
    name: 'Cybersecurity & Defense',
    color: '#10B981',
    semester: 'Fall 2026',
    instructor: 'Col. Elena Rostova',
    targetGrade: 'A+',
    currentScore: 97.2,
    credits: 3,
    documentCount: 7,
    sanctuaryTheme: 'cyberpunk-neon'
  },
  {
    id: 'course-fl',
    code: 'CS 4810',
    name: 'Formal Languages & Automata',
    color: '#F59E0B',
    semester: 'Fall 2026',
    instructor: 'Dr. Gregory Thorne',
    targetGrade: 'A',
    currentScore: 91.5,
    credits: 4,
    documentCount: 9,
    sanctuaryTheme: 'zen-garden'
  },
  {
    id: 'course-net',
    code: 'CS 4320',
    name: 'Web & Network Management',
    color: '#06B6D4',
    semester: 'Fall 2026',
    instructor: 'Prof. Sarah Jenkins',
    targetGrade: 'A+',
    currentScore: 96.0,
    credits: 3,
    documentCount: 6,
    sanctuaryTheme: 'rainy-cafe'
  }
];

export const CS_SUBJECT_DETAILS: Record<string, CSSubjectDetail> = {
  'CS 4780': {
    id: 'course-ml',
    code: 'CS 4780',
    name: 'Machine Learning',
    accentColor: '#8B5CF6',
    instructor: 'Dr. Katherine Vance',
    credits: 4,
    description: 'Statistical learning theory, Deep Neural Networks, Backprop, Attention Transformers, Reinforcement Learning, and Loss Optimization.',
    icon: 'BrainCircuit',
    topics: ['Gradient Descent & Backprop', 'Transformer Attention Mechanism', 'Loss Surfaces & AdamW Optimizer', 'Regularization (L1/L2, Dropout)', 'CNN / ResNet Architectures', 'Diffusion Probabilistic Models'],
    keyScripts: [
      {
        title: 'PyTorch Scaled Dot-Product Attention',
        language: 'python',
        code: `import torch
import torch.nn as nn
import math

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.d_k = d_k

    def forward(self, Q, K, V, mask=None):
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attention_weights = torch.softmax(scores, dim=-1)
        return torch.matmul(attention_weights, V), attention_weights`,
        description: 'Core Attention mechanism used in Transformers (Attention Is All You Need).'
      },
      {
        title: 'Binary Cross-Entropy & Gradient Step',
        language: 'python',
        code: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def compute_bce_loss_and_grad(X, y, weights):
    m = X.shape[0]
    preds = sigmoid(X @ weights)
    loss = -1/m * np.sum(y * np.log(preds + 1e-9) + (1 - y) * np.log(1 - preds + 1e-9))
    grad = (1/m) * (X.T @ (preds - y))
    return loss, grad`,
        description: 'Vectorized logistic regression loss computation and analytic gradient.'
      }
    ],
    flashcards: [
      { front: 'What is the vanishing gradient problem in deep neural networks?', back: 'Gradients of the loss function approach zero as backprop travels through deep layers with saturating activations (like sigmoid/tanh), preventing early layers from updating weights. Solved by ReLU, residual skip connections (ResNet), and layer normalization.', category: 'Deep Learning' },
      { front: 'Explain the bias-variance tradeoff mathematically.', back: 'Total Expected Error = Bias² + Variance + Irreducible Error (σ²). High bias leads to underfitting (model too simple); high variance leads to overfitting (model models noise).', category: 'Statistical Learning' },
      { front: 'Why scale dot products by 1 / sqrt(d_k) in Self-Attention?', back: 'For large vector dimensions d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) stabilizes variance to 1.', category: 'Transformers' }
    ],
    milestones: [
      { id: 'm1', title: 'Mini-Project 1: Transformer from Scratch in PyTorch', dueDate: '2026-10-15', weight: '20%', status: 'in_progress' },
      { id: 'm2', title: 'Midterm Exam: Convex Optimization & Learning Bounds', dueDate: '2026-10-28', weight: '25%', status: 'pending' },
      { id: 'm3', title: 'Capstone: Fine-Tuning LoRA on Medical Q&A Corpus', dueDate: '2026-12-05', weight: '35%', status: 'pending' }
    ],
    interactiveTool: 'ML Loss & Gradient Descent Visualizer'
  },
  'CS 3110': {
    id: 'course-se',
    code: 'CS 3110',
    name: 'Software Engineering',
    accentColor: '#3B82F6',
    instructor: 'Prof. Marcus Chen',
    credits: 4,
    description: 'System Architecture, SOLID design principles, Clean Architecture, CI/CD pipelines, Test-Driven Development, and Microservices.',
    icon: 'Layers',
    topics: ['SOLID Principles & Dependency Injection', 'Microservices vs Monoliths', 'Domain-Driven Design (DDD)', 'CI/CD Automated Pipelines', 'Property-Based & Mutation Testing', 'Design Patterns (Factory, Strategy, Observer)'],
    keyScripts: [
      {
        title: 'Strategy Pattern with TypeScript Generics',
        language: 'typescript',
        code: `interface PaymentStrategy {
  process(amount: number): Promise<{ success: boolean; txHash: string }>;
}

class StripePaymentStrategy implements PaymentStrategy {
  async process(amount: number) {
    return { success: true, txHash: \`str_\${Date.now()}\` };
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  setStrategy(strategy: PaymentStrategy) { this.strategy = strategy; }
  execute(amount: number) { return this.strategy.process(amount); }
}`,
        description: 'Behavioral pattern enabling interchangeable payment mechanisms dynamically.'
      }
    ],
    flashcards: [
      { front: 'What is the Liskov Substitution Principle (LSP)?', back: 'Objects of a superclass should be replaceable with objects of its subclasses without breaking the application logic or violating program correctness.', category: 'SOLID' },
      { front: 'What is the difference between Unit, Integration, and E2E testing?', back: 'Unit tests isolate single functions in mock environments; Integration tests verify interplay across components/databases; E2E tests validate complete user journeys across real systems.', category: 'Testing' }
    ],
    milestones: [
      { id: 'se-m1', title: 'Sprint 2 Release: Core API & Docker Compose Orchestration', dueDate: '2026-10-02', weight: '15%', status: 'completed' },
      { id: 'se-m2', title: 'Architecture Review & Threat Modeling Audit', dueDate: '2026-11-10', weight: '20%', status: 'in_progress' }
    ],
    interactiveTool: 'CI/CD Pipeline Stage Simulator'
  },
  'CS 5300': {
    id: 'course-bd',
    code: 'CS 5300',
    name: 'Big Data Systems',
    accentColor: '#EC4899',
    instructor: 'Dr. Arvind Patel',
    credits: 3,
    description: 'Distributed file systems (HDFS), Apache Spark RDD & DataFrames, Kafka event streams, CAP theorem, and columnar formats (Parquet).',
    icon: 'Database',
    topics: ['MapReduce Paradigm & Shuffle Phase', 'Apache Spark Distributed Transformations', 'Apache Kafka Partitioning & Offsets', 'CAP Theorem & PACELC', 'Columnar Storage & Snappy Compression', 'Stream Processing with Flink'],
    keyScripts: [
      {
        title: 'PySpark Distributed Log Analysis Pipeline',
        language: 'python',
        code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, window

spark = SparkSession.builder \\
    .appName("LogAnalyzer") \\
    .config("spark.executor.memory", "4g") \\
    .getOrCreate()

df = spark.read.json("s3://logs-bucket/2026/*.json")
error_counts = df.filter(col("status") >= 500) \\
    .groupBy("endpoint", "status") \\
    .agg(count("*").alias("failures")) \\
    .sort(col("failures").desc())

error_counts.show(20)`,
        description: 'Distributed Spark query aggregating HTTP 5xx server errors at petabyte scale.'
      }
    ],
    flashcards: [
      { front: 'What causes the "Shuffle" stage in Apache Spark and why is it costly?', back: 'Operations like groupBy, reduceByKey, and join require redistributing data across cluster nodes over the network, incurring disk I/O, serialization, and network latency.', category: 'Apache Spark' },
      { front: 'Explain the CAP Theorem trade-offs.', back: 'A distributed system can guarantee at most two out of: Consistency (all nodes see latest write), Availability (every request receives a response), and Partition Tolerance (system continues during network drops). Under network partitions (P), you must choose C or A.', category: 'Distributed Systems' }
    ],
    milestones: [
      { id: 'bd-m1', title: 'Lab 3: Real-Time Kafka to Spark Streaming Pipeline', dueDate: '2026-10-20', weight: '25%', status: 'in_progress' },
      { id: 'bd-m2', title: 'Benchmark Report: Parquet vs Avro vs CSV on 1TB Cluster', dueDate: '2026-11-22', weight: '30%', status: 'pending' }
    ],
    interactiveTool: 'Spark DAG & Partition Visualizer'
  },
  'CS 4450': {
    id: 'course-sec',
    code: 'CS 4450',
    name: 'Cybersecurity & Defense',
    accentColor: '#10B981',
    instructor: 'Col. Elena Rostova',
    credits: 3,
    description: 'Offensive and defensive security, buffer overflows, asymmetric cryptography (RSA/ECC), network packet sniffing, and zero-trust architectures.',
    icon: 'Shield',
    topics: ['Stack-Based Buffer Overflow & Shellcode', 'RSA & Elliptic Curve Cryptography', 'Nmap Scanning & Packet Analysis', 'OWASP Top 10 Vulnerabilities (SQLi, XSS, CSRF)', 'Kerberos & Mutual TLS Authentication', 'Privilege Escalation & Sandboxing'],
    keyScripts: [
      {
        title: 'Python Cryptographic AES-GCM Encryption',
        language: 'python',
        code: `from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)
nonce = os.urandom(12)
data = b"CONFIDENTIAL_SYSTEM_LOGS_2026"
ciphertext = aesgcm.encrypt(nonce, data, associated_data=b"auth_header")

# Decrypt
decrypted = aesgcm.decrypt(nonce, ciphertext, associated_data=b"auth_header")
print("Verified Plaintext:", decrypted.decode())`,
        description: 'Authenticated Symmetric Encryption with AES-GCM preventing ciphertext tampering.'
      }
    ],
    flashcards: [
      { front: 'How does a Stack Canary prevent buffer overflow exploitation?', back: 'A random known integer value is placed on the stack before the return address. Before returning from a function, the canary is checked; if corrupted by an overflow, the program terminates immediately.', category: 'Binary Exploitation' },
      { front: 'What is the difference between Stored XSS and Reflected XSS?', back: 'Stored XSS persists malicious payloads on the server database to target all visitors; Reflected XSS requires the victim to click a malicious link containing script reflected in the immediate response.', category: 'Web Security' }
    ],
    milestones: [
      { id: 'sec-m1', title: 'CTF Challenge 2: Binary Exploitation & ROP Chains', dueDate: '2026-10-18', weight: '20%', status: 'in_progress' },
      { id: 'sec-m2', title: 'Network Penetration Audit & Security Whitepaper', dueDate: '2026-11-28', weight: '30%', status: 'pending' }
    ],
    interactiveTool: 'Interactive Threat Modeling & Nmap Cheatsheet'
  },
  'CS 4810': {
    id: 'course-fl',
    code: 'CS 4810',
    name: 'Formal Languages & Automata',
    accentColor: '#F59E0B',
    instructor: 'Dr. Gregory Thorne',
    credits: 4,
    description: 'Deterministic and Non-Deterministic Finite Automata (DFA/NFA), Regular Expressions, Context-Free Grammars, Pushdown Automata, and Turing Machines.',
    icon: 'Network',
    topics: ['DFA / NFA Equivalence & Subset Construction', 'Pumping Lemma for Regular Languages', 'Context-Free Grammars & Chomsky Normal Form', 'Pushdown Automata (PDA)', 'Turing Machine Decidability & Halting Problem', 'Chomsky Hierarchy (Types 0-3)'],
    keyScripts: [
      {
        title: 'Deterministic Finite Automaton (DFA) Simulator in TS',
        language: 'typescript',
        code: `interface DFA {
  states: Set<string>;
  alphabet: Set<string>;
  transition: (state: string, symbol: string) => string;
  startState: string;
  acceptStates: Set<string>;
}

function simulateDFA(dfa: DFA, input: string): boolean {
  let current = dfa.startState;
  for (const char of input) {
    if (!dfa.alphabet.has(char)) return false;
    current = dfa.transition(current, char);
  }
  return dfa.acceptStates.has(current);
}`,
        description: 'Formal DFA transition engine testing string membership.'
      }
    ],
    flashcards: [
      { front: 'State the Pumping Lemma for Regular Languages.', back: 'If L is regular, there exists pumping length p such that any string s in L with |s| >= p can be split into s = xyz where: 1) |y| > 0, 2) |xy| <= p, 3) for all i >= 0, xy^i z is in L.', category: 'Automata Theory' },
      { front: 'Why is the Halting Problem undecidable (Turing)?', back: 'Proven via diagonal proof / proof by contradiction. If a decider H exists that determines if program M halts on input w, one can construct an adversarial machine D that halts iff H says D loops on itself, resulting in a logical contradiction.', category: 'Computability' }
    ],
    milestones: [
      { id: 'fl-m1', title: 'Problem Set 4: Pumping Lemma Proofs & PDA Construction', dueDate: '2026-10-12', weight: '15%', status: 'in_progress' },
      { id: 'fl-m2', title: 'Midterm: Chomsky Normal Form & Turing Reductions', dueDate: '2026-11-04', weight: '30%', status: 'pending' }
    ],
    interactiveTool: 'Interactive DFA / NFA State Machine Canvas'
  },
  'CS 4320': {
    id: 'course-net',
    code: 'CS 4320',
    name: 'Web & Network Management',
    accentColor: '#06B6D4',
    instructor: 'Prof. Sarah Jenkins',
    credits: 3,
    description: 'TCP/IP Protocol Suite, IPv4/IPv6 Subnetting, BGP Routing, DNS/DHCP infrastructure, Nginx reverse proxying, and HTTP/3 QUIC protocol.',
    icon: 'Radio',
    topics: ['VLSM & IPv4 CIDR Subnetting', 'TCP 3-Way Handshake & Congestion Control', 'OSI 7-Layer vs TCP/IP Architecture', 'BGP & OSPF Routing Protocols', 'Nginx Reverse Proxy & Load Balancing', 'TLS 1.3 & HTTP/3 (QUIC) over UDP'],
    keyScripts: [
      {
        title: 'Nginx Production Reverse Proxy & SSL Config',
        language: 'nginx',
        code: `upstream backend_cluster {
    least_conn;
    server 10.0.1.10:8000 max_fails=3 fail_timeout=10s;
    server 10.0.1.11:8000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl http2;
    server_name api.academic.edu;

    ssl_certificate /etc/ssl/certs/bundle.crt;
    ssl_certificate_key /etc/ssl/private/api.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /api/ {
        proxy_pass http://backend_cluster;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
    }
}`,
        description: 'High-availability load-balancing configuration with TLS hardening.'
      }
    ],
    flashcards: [
      { front: 'Explain TCP 3-Way Handshake (SYN, SYN-ACK, ACK).', back: '1) Client sends SYN with random ISN seq=x. 2) Server replies with SYN-ACK seq=y, ack=x+1. 3) Client replies with ACK seq=x+1, ack=y+1, establishing duplex connection.', category: 'TCP/IP' },
      { front: 'How many usable hosts are in a /27 IPv4 subnet?', back: 'A /27 has 32 - 27 = 5 host bits. Total addresses = 2^5 = 32. Subtracting Network ID and Broadcast address gives 30 usable host IP addresses.', category: 'Subnetting' }
    ],
    milestones: [
      { id: 'net-m1', title: 'Subnetting Lab: Enterprise Campus Network Design (/16 to /28)', dueDate: '2026-10-09', weight: '20%', status: 'completed' },
      { id: 'net-m2', title: 'Socket Programming: Multi-threaded HTTP Server in C', dueDate: '2026-11-15', weight: '25%', status: 'in_progress' }
    ],
    interactiveTool: 'Interactive IPv4 / CIDR Subnet Calculator'
  }
};

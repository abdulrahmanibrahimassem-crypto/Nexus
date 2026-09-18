import { PodcastEpisode, PodcastSegment } from './podcastAudioEngine';

export interface DocumentAudioSection {
  id: string;
  sectionNumber: number;
  title: string;
  category: 'theorem' | 'definition' | 'derivation' | 'exam_trap' | 'analogy' | 'notes';
  content: string;
  matchedSegmentIdx: number;
  audioTimestamp: string;
  speaker: 'Alex' | 'Maya' | string;
  chapterTitle?: string;
  discussionSnippet: string;
  examAlert?: string;
  suggestedQuestions: string[];
}

/**
 * Intelligent parser that breaks down uploaded or indexed study materials
 * into logical academic sections and injects interactive podcast audio-timestamps.
 */
export function parseDocumentWithAudioTimestamps(
  documentContent: string,
  documentTitle: string,
  podcastEpisode: PodcastEpisode
): DocumentAudioSection[] {
  if (!documentContent || !documentContent.trim()) {
    return [];
  }

  const segments = podcastEpisode.segments || [];
  const text = documentContent.trim();

  // 1. Split document by logical boundaries (Markdown headers, numbered points, double newlines)
  const rawBlocks = text
    .split(/\n\s*\n+|(?=^#{1,4}\s+)|(?=^[0-9]+\.\s+[A-Z])|(?=^Step\s+[0-9]+:)|(?=^Problem\s+[0-9]+:)|(?=^Theorem\s+[0-9.]+)|(?=^Definition\s+[0-9.]+)/gm)
    .map(b => b.trim())
    .filter(b => b.length > 20); // filter out empty or trivial one-word fragments

  // If the document is short or a single monolithic block, split by sentences into chunks
  let candidateBlocks = rawBlocks;
  if (candidateBlocks.length <= 1) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    candidateBlocks = [];
    let currentChunk: string[] = [];
    sentences.forEach(s => {
      currentChunk.push(s);
      if (currentChunk.join(' ').length >= 180) {
        candidateBlocks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    });
    if (currentChunk.length > 0) {
      candidateBlocks.push(currentChunk.join(' '));
    }
  }

  const sections: DocumentAudioSection[] = candidateBlocks.map((block, idx) => {
    // Determine category
    const lower = block.toLowerCase();
    let category: DocumentAudioSection['category'] = 'notes';
    let examAlert: string | undefined;

    if (lower.includes('trap') || lower.includes('mistake') || lower.includes('rubric') || lower.includes('deduct') || lower.includes('loss') || lower.includes('pitfall')) {
      category = 'exam_trap';
      examAlert = 'High-frequency exam grading penalty alert. Boundary verification required.';
    } else if (lower.includes('theorem') || lower.includes('law') || lower.includes('lemma') || lower.includes('invariance') || lower.includes('conserved')) {
      category = 'theorem';
    } else if (lower.includes('definition') || lower.includes('notation') || lower.includes('variables') || lower.includes('axiom')) {
      category = 'definition';
    } else if (lower.includes('step') || lower.includes('derive') || lower.includes('derivation') || lower.includes('equation') || lower.includes('formula')) {
      category = 'derivation';
    } else if (lower.includes('analogy') || lower.includes('intuitive') || lower.includes('fluid') || lower.includes('glass') || lower.includes('imagine')) {
      category = 'analogy';
    }

    // Extract a concise clean title
    const firstLine = block.split('\n')[0].replace(/^#{1,4}\s*/, '').trim();
    let title = firstLine.slice(0, 70);
    if (title.length < 15 && block.length > title.length) {
      title = `${title} - ${block.slice(title.length, title.length + 45)}...`.replace(/\n/g, ' ');
    }
    if (!title) {
      title = `Section ${idx + 1}: Key Academic Concept`;
    }

    // Match best segment in podcast
    let bestSegmentIdx = -1;
    let highestScore = -1;

    // Search for explicit citation or semantic overlap
    segments.forEach((seg, sIdx) => {
      let score = 0;
      const segText = seg.text.toLowerCase();
      const citeTitle = (seg.sourceCitation?.title || '').toLowerCase();
      const citeSnippet = (seg.sourceCitation?.snippet || '').toLowerCase();

      // Direct source title match
      if (citeTitle && documentTitle.toLowerCase().includes(citeTitle)) {
        score += 3;
      }

      // Keyword overlaps
      const keywords = ['boundary', 'invariant', 'proof', 'fluid', 'exam', 'trap', 'solution', 'homework', 'monotonic', 'theorem', 'relaxation', 'dirichlet'];
      keywords.forEach(kw => {
        if (lower.includes(kw) && (segText.includes(kw) || citeSnippet.includes(kw))) {
          score += 2;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestSegmentIdx = sIdx;
      }
    });

    // Fallback to proportional timeline mapping if no strong keyword match
    if (bestSegmentIdx === -1 || highestScore <= 0) {
      const ratio = candidateBlocks.length > 1 ? idx / (candidateBlocks.length - 1) : 0;
      bestSegmentIdx = Math.min(segments.length - 1, Math.floor(ratio * (segments.length - 1)));
    }

    const matchedSeg = segments[bestSegmentIdx] || segments[0] || {
      timestamp: '0:00',
      speaker: 'Alex',
      text: 'Introductory discussion of coursework foundations.'
    };

    // Formulate suggested questions
    const suggestedQuestions = [
      `Can you explain the main idea of "${title.slice(0, 35)}" in plain English?`,
      `What is the #1 exam trap in this section?`,
      `Give me an intuitive real-world analogy for this concept.`
    ];

    return {
      id: `doc-sec-${idx}-${Date.now().toString(36)}`,
      sectionNumber: idx + 1,
      title,
      category,
      content: block,
      matchedSegmentIdx: bestSegmentIdx,
      audioTimestamp: matchedSeg.timestamp,
      speaker: matchedSeg.speaker,
      chapterTitle: matchedSeg.chapterTitle,
      discussionSnippet: matchedSeg.text.length > 130 ? matchedSeg.text.slice(0, 130) + '...' : matchedSeg.text,
      examAlert,
      suggestedQuestions
    };
  });

  return sections;
}

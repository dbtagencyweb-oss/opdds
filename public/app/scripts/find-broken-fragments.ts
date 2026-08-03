import { artifactBookData } from '../src/data/artifactBookData';

type Block = { type: string; text?: string; items?: string[] };

const startsLowercase = (text: string) => /^[a-zà-ú]/.test(text.trim());

for (const chapter of artifactBookData.chapters as any[]) {
  for (const section of chapter.sections as any[]) {
    const blocks: Block[] = section.blocks || [];
    blocks.forEach((block, index) => {
      if (!block.text) return;
      if (startsLowercase(block.text)) {
        console.log(`${chapter.id} / ${section.id} [block ${index}, type=${block.type}]`);
        console.log(`  "${block.text.slice(0, 100)}${block.text.length > 100 ? '...' : ''}"`);
      }
    });
  }
}

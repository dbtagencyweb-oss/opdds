import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReaderService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedPageContent() {
    const revisions = await this.prisma.bookPageRevision.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ pageNumber: 'asc' }, { createdAt: 'desc' }],
    });

    const latestByPage = new Map<number, any>();
    for (const revision of revisions) {
      if (!latestByPage.has(revision.pageNumber)) {
        latestByPage.set(revision.pageNumber, {
          pageNumber: revision.pageNumber,
          title: revision.title,
          content: revision.content,
          version: revision.version,
          publishedAt: revision.publishedAt,
          updatedAt: revision.updatedAt,
        });
      }
    }

    return Array.from(latestByPage.values());
  }

  async listPublishedAudioTracks() {
    const [revisions, metas] = await Promise.all([
      this.prisma.bookAudioRevision.findMany({
        orderBy: [{ chapterId: 'asc' }, { sectionKey: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.bookAudioTrackMeta.findMany(),
    ]);
    const metaByTrack = new Map(metas.map((meta) => [`${meta.chapterId}:${meta.sectionKey}`, meta]));

    const latestByTrack = new Map<string, any>();
    for (const revision of revisions) {
      const key = `${revision.chapterId}:${revision.sectionKey}`;
      const meta = metaByTrack.get(key);
      if (!latestByTrack.has(key)) {
        latestByTrack.set(key, {
          chapterId: revision.chapterId,
          sectionKey: revision.sectionKey,
          label: revision.label,
          url: revision.url,
          coverUrl: revision.coverUrl || meta?.coverUrl || null,
          sortOrder: meta?.sortOrder ?? 0,
          version: revision.version,
          publishedAt: revision.publishedAt,
          updatedAt: revision.updatedAt,
        });
      }
    }

    return Array.from(latestByTrack.values()).sort((a, b) =>
      a.chapterId.localeCompare(b.chapterId) || a.sortOrder - b.sortOrder || a.sectionKey.localeCompare(b.sectionKey),
    );
  }
}

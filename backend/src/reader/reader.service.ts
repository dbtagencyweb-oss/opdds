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
    const revisions = await this.prisma.bookAudioRevision.findMany({
      orderBy: [{ chapterId: 'asc' }, { sectionKey: 'asc' }, { createdAt: 'desc' }],
    });

    const latestByTrack = new Map<string, any>();
    for (const revision of revisions) {
      const key = `${revision.chapterId}:${revision.sectionKey}`;
      if (!latestByTrack.has(key)) {
        latestByTrack.set(key, {
          chapterId: revision.chapterId,
          sectionKey: revision.sectionKey,
          label: revision.label,
          url: revision.url,
          version: revision.version,
          publishedAt: revision.publishedAt,
          updatedAt: revision.updatedAt,
        });
      }
    }

    return Array.from(latestByTrack.values());
  }
}

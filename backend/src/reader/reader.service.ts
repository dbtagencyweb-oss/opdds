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
}

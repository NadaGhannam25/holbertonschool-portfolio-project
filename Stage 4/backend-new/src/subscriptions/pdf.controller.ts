import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtGuard } from '../common/jwt.guard';
import { generateSubscriptionsPdf } from '../services/pdf';

@UseGuards(JwtGuard)
@Controller('subscriptions/export')
export class PdfController {
  @Get('pdf')
  async exportPdf(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).userId as number;
    try {
      const pdfBuffer = await generateSubscriptionsPdf(userId);
      const fileName = `dierha-subscriptions-${new Date().toISOString().slice(0, 10)}.pdf`;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (err) {
      console.error('[PDF] خطا:', err);
      res.status(500).json({ message: 'فشل تصدير التقرير' });
    }
  }
}

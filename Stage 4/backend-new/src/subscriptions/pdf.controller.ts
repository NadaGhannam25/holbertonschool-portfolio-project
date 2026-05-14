import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { generateSubscriptionsPdf } from '../services/pdf';

@UseGuards(JwtAuthGuard)
@Controller('api/subscriptions/export')
export class PdfController {
  @Get('pdf')
  async exportPdf(@Req() request: AuthenticatedRequest, @Res() res: Response) {
    try {
      const userId = request.user!.sub;
      const pdfBuffer = await generateSubscriptionsPdf(userId);

      const fileName = `dierha-subscriptions-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      console.error('[PDF] Error:', error);
      res.status(500).json({ message: 'Failed to export PDF report' });
    }
  }
}

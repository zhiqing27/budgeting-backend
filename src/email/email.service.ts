// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'), 
      auth: {
        user: this.configService.get<string>('EMAIL_USER'), 
        pass: this.configService.get<string>('EMAIL_PASS'), 
      },
    });
  }

  async sendBudgetExceededAlert(userEmail: string, exceededCategories: Array<{ category: string; totalExpenses: string; budgetedAmount: string }>) {
    const subject = "Budget Exceeded Alert";

    const categoryDetails = exceededCategories
      .map(cat => `Category: ${cat.category}, Total Expenses: $${cat.totalExpenses}, Budgeted Amount: $${cat.budgetedAmount}`)
      .join('\n');

    const message = `
      Hello,

      You have exceeded your budget in the following categories:

      ${categoryDetails}

      Please review your expenses.

      Best regards,
      Budget Management Team
    `;

    try {
      // Send the email using the email client of choice
      await this.sendEmail({
        to: userEmail,
        subject,
        text: message,
      });

      console.log(`Budget exceeded alert sent to ${userEmail}`);
    } catch (error) {
      console.error(`Failed to send budget exceeded alert to ${userEmail}:`, error);
    }
  }

 
  private async sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {

    console.log(`Sending email to ${to} with subject "${subject}" and body:\n${text}`);
  }
}

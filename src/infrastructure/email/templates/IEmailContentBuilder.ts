export interface EmailContent {
    subject: string;
    heading: string;
    htmlContent: string;
    textContent: string;
}

export interface IEmailContentBuilder {
    build(): EmailContent;
}

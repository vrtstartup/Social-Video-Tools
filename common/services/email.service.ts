import { config } from '../../common/config';
const postmark = require('postmark');

export class Email {
  private logger;

  constructor(logger?: any) { 
    this.logger = logger ? logger : null;
  }

  notify(targetAddress:string, type:string, projectId: string) {
    const client = new postmark.Client(config.mail.postmark.secret);

    return new Promise((resolve, reject) => {
      client.sendEmail({
        "From": `${config.mail.from}`,
        "To": targetAddress,
        "Subject": `Your projects's ${type} job has been completed!`, 
        "TextBody": `You can download your file here: ${config.routing.fileServer.protocol}://${config.routing.fileServer.domain}:${config.routing.fileServer.port}/api/file/render/${projectId}`
      }, (err, result) => err ? reject(err) : resolve(result))
    });
    

  }
}
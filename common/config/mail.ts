export const mailConfig = {
   from: 'matthias.devriendt@vrt.be',
   protocol: 'smtps',
   postmark: {
     secret: process.env.POSTMARK_SECRET
   }
};
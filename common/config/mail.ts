export const mailConfig = {
   from: 'socialvideotool@vrt.be',
   protocol: 'smtps',
   postmark: {
     secret: process.env.POSTMARK_SECRET
   }
};
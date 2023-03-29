const express = require('express');
const Africastalking = require('africastalking');
const router = express.Router();
const config = require('config');

//send airtime
const authentication = Africastalking(config.get('authentication')).AIRTIME;
console.log(authentication);

const sendAirtime = async (phoneNumber) => {
    const output = await authentication.send({
        maxNumRetry: 1,
        recipients: [
            {
                phoneNumber: `${phoneNumber}`,
                amount: 1,
                currencyCode: 'KES',
            }
        ],
    });
    console.log('phone number', phoneNumber);
    console.log({ output });
};

//send sms

const sendSMS = async (phoneNumber, message) => {
    const sms = Africastalking(config.get('authentication')).SMS;
  
    const options = {
      to: [phoneNumber],
      message: message
    };
  
    try {
      const response = await sms.send(options);
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  


router.get('/', (req, res) => res.send('Hello World!'));

router.post('/fgm-survey', async (req, res) => {
    try {
        const { sessionId, serviceCode, phoneNumber, text } = req.body;

        // Split the text into an array of words
        const words = text.split('*');

        // Determine the current question and response
        const currentQuestion = words.length - 1;
        const currentResponse = parseInt(words[currentQuestion]);

        let response = '';

        if (currentQuestion === 0) {
            response = `CON Welcome to the FGM survey. This survey will consist of multiple choice questions to assess your knowledge on FGM.
            \nFGM stands for Female Genital Mutilation. There are 4 types of FGM: Clitoridectomy, Excision,Infibulation, Other.
            The health risks of FGM include: Infection,Excessive bleeding, Death & Difficulty in passing urine.
          \n

            1. Start Survey`;
        }
        else if (currentQuestion === 1) {
            response = `CON Is FGM a harmful practice?\n1. Yes\n2. No`
        }
        else if (currentQuestion === 2) {
            response = `CON The following are health risks of FGM which one is not?\n1. Increased fertility\n2. Excessive bleeding\n3. Death`
        }
        else if (currentQuestion === 3) {
            response = `CON How many types of FGM are there?\n1. None\n2. 2 types\n3. 4 types`
        }
        else if (currentQuestion === 4) {
            response = `CON The following factors contribute to FGM. Which one does not?\n1. Poverty\n2. Lack of education\n3. Creating awareness`
        }
        else if (currentQuestion === 5) {
            response = `CON The following are FGM solutions which one is not?\n1.Education \n2. Awareness \n3. Circumscision of infants`
        } else{
            response = `END Thank you for filling the survey. You will receive airtime shortly.`;
            //sendAirtime(phoneNumber);
            sendSMS(phoneNumber, `Thank you for filling the survey. You will receive airtime shortly.`);

            // Calculate the participant's score
            const score = currentResponse;

            // End of the survey - send confirmation message and airtime if score is above threshold
            let message = `Thank you for completing the survey, ${words[1]}! Your feedback has been received.`;

            if (score >= 4) {
                sendAirtime(phoneNumber);
          
            }    

        }

        //response = `END Thank you for reporting fgm case. You will receive airtime shortly.`;
        
        res.set('Content-Type: text/plain');
        res.send(response);
    } catch (error) {
        console.trace(error);
        response = `END There is an error. Try again later.`;
        res.set('Content-Type: text/plain');
        res.send(response);
    }
});

module.exports = router;
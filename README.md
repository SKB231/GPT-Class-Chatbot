# ITS-Swift-GPTChatBot
This repository tracks the development for a iOS GPTChatBot. This is meant to be a component to the Swift QuizApp. Students needing additional support in understanding concepts and receiving relevant information for the course while using QuizApp. 
### Semester Goals:
- Fine Tune the model with class specific information using GPT’s Function calling and model training.
- Make every chatroom  for each student private. Thus students will get a personalized tutoring experience.

## Contributors: 
- Shreekrishna R Bhat
- Phillip Phanhthourath
- Reese Wang
- Tom Thayyil Thomas
- Nikita Shinil
- Titiksha Agarwal
- Everest Max
- Alvin Fabrio Tama Arel

## Project running instructions:
To setup run the project we need to do two things:
- Add the OPENAI credentials in the .env file
- Run the backend service
- Start the swift front end from XCode.

To run the project, head to the Swift_Backend directory. Here add a .env file and add the following contents:
**<br>OPENAI_API_KEY=<OPENAI_KEY><br>PORT=<PORT_NUMBER>**
Then, open a terminal instance and cd into the Swift_Backend directory, and execute command:
**npm start**

Now that the backend project is running, we now begin running the front end from XCode. Open the project in XCode by double clicking the **"newApp.xcodeproj"** file. This should open the app.

Click the :OPENAI: logo to allow the backend to retrive responses from the GPT model. The autocomplete functionality should also be visible when you type any characters into the input.


## File Structure

### Frontend
The frontend code and the socket interface is present in SocketTest.swift file. The file contains two major structures. One is the service struct, which contains the logic to handle the socket connections and responses from the backend service. The other is the SocketTest struct which is the View object that displays the actual contents of the chatbot.

### Backend
The backend code is in /Swift_Backend/. The backend API endpoints for managing the database and retrieving autocomplete suggestions are at /Swift_Backend/database.js. The code to host the Socket.io server is at /Swift_Backend/server.js. 

## Project Demo:
- Web Parser: https://drive.google.com/file/d/1G5qi2lppR3WfnXuO5EUFrtNmoS5NsIP-/view?resourcekey
- App: https://www.youtube.com/watch?v=DfDIkFc_3sA

## Project presentation:
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/4f63f5ab-aca1-406c-8991-9899aaf1c992)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/e2c36273-f972-4277-af30-6a7724905389)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/906b1722-32b3-458e-9288-d1a7eb2b0d1d)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/7764b59b-f738-4e5e-b8cf-915622ff161c)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/65cc7d89-14e7-4263-af10-f25f8e0bc7e4)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/f77443e1-28c7-4ff5-a797-7dd039371f7e)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/dd48e28f-f259-4296-b8d9-09c879a91a12)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/86ca5db9-25d4-498b-88f4-ac2ad81588a3)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/17e24673-35cf-4a4a-badb-c5bd7ba2e3a0)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/a1d9d455-1ee1-4a15-859d-7a39a2e8060c)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/b6c6442b-4d5c-4634-8a73-23fd36c351c8)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/2c998fb7-7a19-4110-9366-52df1ffe26df)
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/f5f9e384-454b-4ca9-b1cd-c4467fd2ee29)






# ITS-Swift-GPTChatBot
This repository tracks the development for a iOS GPTChatBot. This is meant to be a component to the Swift QuizApp.

## Fall 2023 Team Memebrs
- Shreekrishna R Bhat
- Phillip Phanhthourath
- Reese Wang

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

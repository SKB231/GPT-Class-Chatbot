# ITS-Swift-GPTChatBot
This repository tracks the development for a iOS GPTChatBot. This is meant to be a component to the Swift QuizApp.

The goal of this application is to allow students to easily access questions and get course-relevant answers from the model along with leveraging the model’s power to help explain the concepts easily.
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/881a428f-02cb-41bf-acbe-afc7274d92f9)


In addition to answering questions relevant to course material, the chatbot can take additional information in the input such as course logistics and answer them as well.
![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/09ede305-5fe4-4ce0-a934-5c2648da5558)

By specifying the course textbook the chatbot can limit the scope of answers to that of the textbook.
Similarly, it can be extremely helpful in helping students practice their concepts, and not just understand them.

![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/6e4291ff-0169-4e5a-8d48-694eda688e54)


### Chat Interface
Interactive and simplistic design 
Full emphasis on ease of use 
A simulation of texting messaging application 
Several modes: GPT active & Profesor override 

![image](https://github.com/SKB231/GPT-Class-Chatbot/assets/80944218/8f241735-ab05-4c96-8b97-41c6bff4fc04)

### Autocomplete functionality:
- Averages around 0.03s to compute!
- Filters + Primary Sort Order
- Prefix Matches
- Pattern Matches
- Any Word Matches
- Auxiliary Weighing Function
-   Strategically weighs together length, frequency, and similarity to produce a likelihood.
-   Used to further sort suggestions within the primary sort categories.


## Fall 2022 Team Memebrs
- Shreekrishna R Bhat
- Alvin Fabrio Tama Arel
- Max Everest

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

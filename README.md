# ITS-Swift-GPTChatBot
This repository tracks the development for a iOS GPTChatBot. This is meant to be a component to the Swift QuizApp.

## Setup
**App:** Download the latest Swift and Xcode version. After downloading both, clone this repo as a project and save it. After that, change the build device to ios device.

**Database:** We used a MongoDB Atlas cluster to store the generated questions and answers. To access the database, download MongoDB Compass [here](https://www.mongodb.com/try/download/compass). Since this is a cloud-based database, there is no need to download mongo itself. Connect to the database with the connection string:

- `mongodb+srv://quizAppMobileUser:xkLaBBaa1dTsZuX8@quizappdb.7ltdg.mongodb.net/test`

## Fall 2022 Team Memebrs
- Shreekrishna R Bhat
- Alvin Fabrio Tama Arel
- Max Everest

## [Figma Link to Wireframing (From Fall 2022 team)](https://www.figma.com/file/QxqNtFrd8C7XOSHJsooLfQ/SWIFT-App-Protype?node-id=0%3A1&t=qOEb56QCIo9ARpFr-0)

## NewAppApp.swift
- Loads the Log In page

## LogIn.swift
- Log in presents a log in page to the user which allows them to enter a valid username and password to access the app. It then presents a menu to the user where they are able to choose from multiple options such as settings, flashcards, quizzes, saved questions, and progress. This file also contains a large portion of the flashcard code which is part of the multiple options presented to the user. 

## QuizView.swift
- Loads the quiz content and the functionality of the flashcard such as flipping the flashcard. 


## Branch Organization
- The new main branch sould contain the most recent running code





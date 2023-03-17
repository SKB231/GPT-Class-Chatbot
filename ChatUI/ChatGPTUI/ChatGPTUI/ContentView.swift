//
//  ContentView.swift
//  ChatGPTUI
//
//  Created by Alvin Fabrio on 3/15/23.
//

import SwiftUI

struct ContentView: View {
    

//    @State var chatMessages: [ChatMessage] = ChatMessage.sample
    @State var chatMessages: [ChatMessage] = []
    //Keeping tack of messagText in textField
    @State var messageText: String = ""
    
    //Main stack
    var body: some View {
        VStack{
            ScrollView{
                LazyVStack {
                    ForEach(chatMessages, id: \.id) { message in
                        messageView(message: message)
                    }
                }
            }
            //Message textField
            HStack{
                TextField("Enter a mesage", text: $messageText){
                }
                    .padding()
                    .background(.gray.opacity(0.1))
                    .cornerRadius(12)
        
                //Send button
                Button{
                    //Set on Action function
                    sendMessage()
                }label:{
                    Text("Send")
                        .foregroundColor(.white)
                        .padding()
                        .background(.gray)
                        .cornerRadius(12)
                }
                Button{
                    //Set on Action function
                    clearMessage()
                }label:{
                    Text("X")
                        .foregroundColor(.white)
                        .padding()
                        .background(.red)
                        .cornerRadius(12)
                }
            }
        }
        .padding()
    }
    
    //Textbox
    func messageView(message: ChatMessage) -> some View {
        HStack{
            if message.sender == .user {Spacer() }
            Text(message.content)
                .foregroundColor(message.sender == .user ? .white : .black)
                .padding()
                .background(message.sender == .user ? .blue : .gray.opacity(0.1))
                .cornerRadius(16)
            if message.sender == .gpt {Spacer() }
        }
    }
    
    //Send button set on Action
    func sendMessage(){
        let userMessage = ChatMessage (id:UUID().uuidString, content: messageText, date: Date(), sender: .user)
        messageText = ""
        chatMessages.append(userMessage)
    }
    
    func clearMessage(){
        chatMessages.removeAll()
    }
}
 
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

struct ChatMessage {
    let id: String
    let content: String
    let date: Date
    let sender: MessageSender
}

enum MessageSender{
    case user
    case gpt
}

//Testing sample conversation 

//extension ChatMessage{
//    static let sample = [
//        ChatMessage(id:UUID().uuidString, content: "sample message from user", date: Date(), sender: .user),
//        ChatMessage(id:UUID().uuidString, content: "sample message from GPT", date: Date(), sender: .gpt),
//        ChatMessage(id:UUID().uuidString, content: "sample message from user", date: Date(), sender: .user),
//        ChatMessage(id:UUID().uuidString, content: "sample message from GPT", date: Date(), sender: .gpt)
//    ]
//}

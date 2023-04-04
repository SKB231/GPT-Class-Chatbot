
import Foundation
import SwiftUI
import SocketIO

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config:[.log(true), .compress])
    @Published var messages = [ChatMessage]()
    @Published var promtResults = [String]()
    public var socket : SocketIOClient
    public var connected : Bool = false
    
    init () {
        socket = manager.defaultSocket
        print("creating the event handler for the connect event:");
        socket.on(clientEvent: .connect) {

            (data, ack) in
            
            self.messages.append(ChatMessage.getChatMessage(stringMessage: "Socket is connected!", sender: MessageSender.gpt));
            self.connected = true
            
            //Function to handle socket event where the Server sends back the Autocomplete response:
            self.socket.on("RecieveAutoCompleteResponse") {
                (data, ack) in
                // Recieving data in the form of: [QuestionObject 1, QuestionObject 2, QuestionObject 3, ...], where each QuestionObject has question, chapter, frequency, ...
                print("recieved something! 0")
                print(dump(data))
                print(dump(data[0]))
                if let messages = data[0] as? [[String: Any]] {
                    self.promtResults.removeAll()
                    print("recieved something! 1")
                    for message in messages {
                        let question = message["question"] as? String ?? "Undefined"
                        self.promtResults.append(question)
                    }
                }
                
            }
            
            
            // Function to handle the socket event where the GPT sends back a response to a message that the user had sent
            self.socket.on("RecieveMessageResponse") {
                (data, ack) in
                print(dump(data))
                
                if let messageContentData = data[0] as? [String: String], let rawMessage = messageContentData["msg"], let newMessageSender = messageContentData["sender"]{
                    DispatchQueue.main.async {
                        if newMessageSender == "GPT" {
                            self.addMessage(newMessage: rawMessage, sender: MessageSender.gpt)
                        } else {
                            self.addMessage(newMessage: rawMessage, sender: MessageSender.user)
                        }
                    }
                }
            }
                    
        }
        
        socket.connect()
    }
    
    public func addMessage(newMessage: String, sender: MessageSender) {
        self.messages.append(ChatMessage.getChatMessage(stringMessage: newMessage, sender: sender))
    }
    public func printMessageArray() {
        for message in self.messages {
            print(message.content , " by " , message.sender , " at " , message.date)
        }
    }
    
    public func clearAllMessages() {
        self.messages.removeAll()
    }
    
    public func clearAllPromts() {
        self.promtResults.removeAll()
    }
}



struct SocketTest : View {
    @ObservedObject var service = Service()
    @State private var currentMessage : String = ""
    
    @State var chatMessages: [ChatMessage] = []
    //Keeping tack of messagText in textField
    @State var messageText: String = ""
    @State var useGPT: Bool = false

    var body: some View {
        VStack {
            ScrollView{
                LazyVStack {
                    ForEach(service.messages, id: \.id) { message in
                        messageView(message: message)
                    }
                }
            }

            //Message textField
            HStack{
                Button{
                    //Set on Action function
                    toggleGPTTag()
                }label:{
                    Text("useGPT")
                        .foregroundColor(.white)
                        .padding()
                        .background(useGPT ? .green : .red)
                        .cornerRadius(12)
                }
                TextField("Enter a mesage", text: $currentMessage){
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
        service.addMessage(newMessage: currentMessage, sender: MessageSender.user)
        if service.connected == false {
            sendFakeGPTMessage(message: "Message was not recieved. Wait for connection to Socket.")
        } else {
            if useGPT == true{
                service.socket.emit("RecieveUserMessage", ("/useGPT "+currentMessage))
            } else {
                print("Hlwjehwrg")
                service.socket.emit("RecieveUserMessage", (currentMessage))

            }
        }
        currentMessage = ""
    }
    
    
    func toggleGPTTag() {
        useGPT = !useGPT
    }
    
    func sendFakeGPTMessage(message: String) {
        service.addMessage(newMessage: message, sender: MessageSender.gpt)
    }
    
    func clearMessage(){
        service.clearAllMessages()
    }
}

struct AutoCompleteTest: View {
    @ObservedObject var service = Service()
    @State private var searchText = ""
    @State private var showSuggestions = false
    var body: some View {
        VStack {
            TextField("Search", text: $searchText)
                .onChange(of: searchText) { value in
                    showSuggestions = !searchText.isEmpty
                }
                .padding()
                .background(.gray.opacity(0.1))
                .cornerRadius(12)
            
            if showSuggestions {
                List(service.promtResults, id: \.self) { suggestion in
                    Text(suggestion)
                    
                    //set on Action
                    //Still need to mak it expand upwards
                    
                        .onTapGesture {
                            searchText = suggestion
                            showSuggestions = false
                            
                            // enter fucntion/function body here
                        
                        }
                }
                .frame(maxHeight: 200)
                .listStyle(.sidebar)
            
            }
        }
        .onChange(of: self.searchText) { newValue in
            if newValue == "" {
                service.clearAllPromts()
            } else {
                sendPromt()
            }
        }
    }
    
    func sendPromt() {
        service.socket.emit("RecieveAutoCompleteRequest", searchText)
    }
}
struct Previews_SocketTest_Previews: PreviewProvider {
    static var previews: some View {
        AutoCompleteTest()
    }
}


public struct ChatMessage {
    let id: String
    let content: String
    let date: Date
    let sender: MessageSender
    
    public static func getChatMessage(stringMessage: String, sender: MessageSender) -> ChatMessage {
        let message = ChatMessage(id: UUID().uuidString, content: stringMessage, date: Date(), sender: sender)
        return message
    }
}

public enum MessageSender{
    case user
    case gpt
}

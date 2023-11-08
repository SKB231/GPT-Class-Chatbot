
import Foundation
import SwiftUI
import SocketIO

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:6000")!, config:[.log(true), .compress])
    @Published var messages = [ChatMessage]();
    @Published var promtResults = [String]();
    public var socket : SocketIOClient;
    public var connected : Bool = false;
    @Published public var GoogleUID: String = "";
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
                        let question = message["query"] as? String ?? "Undefined"
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
    
    
    public func updateQueryFrequency(question: String) {
        socket.emit("UpdateQuestionFrequency", question);
    }
    
    public func attemptSocketConnection() {
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
    @State private var showSuggestions = false
    
    init() {
    }
    
    
    var body: some View {
        VStack {
            ScrollView{
                LazyVStack {
                    Text(service.GoogleUID)
                    ForEach(service.messages, id: \.id) { message in
                        messageView(message: message)
                    }
                }
            }
            
            if showSuggestions {
                List(service.promtResults, id: \.self) { suggestion in
                    Text(suggestion)
                    
                    //set on Action
                    //Still need to mak it expand upwards
                        .onTapGesture {
                            currentMessage = suggestion
                            showSuggestions = false
                            
                            service.updateQueryFrequency(question: suggestion)
                            // enter fucntion/function body here
                            service.clearAllPromts()
                            
                        }
                }
                .frame(maxHeight: 200)
                .listStyle(.sidebar)
            
            }

            HStack {
                Button {
                    toggleGPTTag()
                } label: {
                    Image("logo")
                        .resizable()
                        .frame(width: 22, height: 22) // set the appropriate size
                        .padding()
                        .background(useGPT ? .blue : .red)
                        .cornerRadius(12)
                }
                
                TextField("Enter a message", text: $currentMessage)
                .onChange(of: currentMessage) { value in
                    showSuggestions = !currentMessage.isEmpty
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                .overlay(
                   
                    HStack {
                        Spacer()
                        Button(action: sendMessage) {
                            Image(systemName: "paperplane.fill")
                                .foregroundColor(.blue)
                                .background(Color.gray.opacity(0.0))
                                .padding()
                        }
                        .frame(width: 50, height: 100)
                    }
                )
                Button {
                    clearMessage()
                } label: {
                    Text("X")
                        .foregroundColor(.white)
                        .padding()
                        .background(.red)
                        .cornerRadius(12)
                }
            }
            .padding(.horizontal)
        }
        .padding()
        .onChange(of: self.currentMessage) { newValue in
            if newValue == "" {
                service.clearAllPromts()
            } else {
                sendPromt()
            }
        }
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
            //try and send additional parameters along with message.
        }
    }
    
    //Send button set on Action
    func sendMessage(){
        
        service.addMessage(newMessage: currentMessage, sender: MessageSender.user)
       
        
        if service.connected == false {
            sendFakeGPTMessage(message: "Message was not recieved. Wait for connection to Socket, attempting socket connection again: ")
            service.attemptSocketConnection()
        } else {
            if useGPT == true{
                currentMessage = "/useGPT " + currentMessage
            }
            let finalMessage = String(format:
    """
    {"userId": "%@","message": "%@"}
    """, service.GoogleUID, currentMessage)
            print(finalMessage)
            service.socket.emit("RecieveUserMessage", finalMessage)
        }
        currentMessage = ""
    }
    
    func sendPromt() {
        if(currentMessage != "") {
            service.socket.emit("RecieveAutoCompleteRequest", currentMessage)
        }
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

struct Previews_SocketTest_Previews: PreviewProvider {
    static var previews: some View {
        SocketTest()
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

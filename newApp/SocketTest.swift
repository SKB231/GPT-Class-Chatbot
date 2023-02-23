//
//  SocketTest.swift
//  newApp
//
//  Created by Shreekrishna R Bhat on 2/22/23.
//

import Foundation
import SwiftUI
import SocketIO

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config:[.log(true), .compress])
    @Published var messages = [String]()
    public var socket : SocketIOClient
    public var connected : Bool = false
    
    init () {
        socket = manager.defaultSocket
        print("creating the event handler for the connect event:");
        socket.on(clientEvent: .connect) {
            (data, ack) in
            
            print("Connected")
            
            self.socket.on("iOS Client Port") {
                (data, ack) in
                self.connected = true
                print(dump(data))
                if let data = data[0] as? [String: String],
                   let rawMessage = data["msg"] {
                    DispatchQueue.main.async {
                        self.messages.append(rawMessage)
                    }
                }
            }
                    
        }
        
        socket.connect()
    }
}



struct SocketTest : View {
    @ObservedObject var service = Service()
    @State private var currentMessage : String = ""
    var body: some View {
        VStack {
            TextField("Username", text: $currentMessage)
                .padding()
                .frame(width: 300, height: 50)
                .background(Color.black.opacity(0.05))
                .cornerRadius(10)
            Button("Send Message") {
                service.socket.emit("NodeJS Server Port", currentMessage)
            }
            .foregroundColor(.white)
            .frame(width: 300, height: 50)
            .background(Color.orange)
            .cornerRadius(10)

            Text("Recieved messages from Node.js: ")
                .font(.largeTitle)
            ForEach(service.messages, id: \.self) {
                msg in
                Text(msg).padding()
            }
        }
    }
}

struct Previews_SocketTest_Previews: PreviewProvider {
    static var previews: some View {
        SocketTest()
    }
}

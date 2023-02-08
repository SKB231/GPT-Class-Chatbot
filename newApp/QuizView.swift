//
//  QuizView.swift
//  newApp
//
//  Created by Neha Lalani on 11/2/22.


import SwiftUI
//import RealmSwift
//let realmApp = RealmSwift.App(id: "application-0-usith")

let data = DataLoader().userData

struct QuizView: View {
   
   // typealias Body = <#type#>
    @State var backDeg = 90.0
    @State var frontDeg = 0.0
    @State var isFlipped = false


    let durationAndDelay: CGFloat = 0.2

    @State var questionNum = 0

    var body: some View {
        /*
        let realm = try! Realm()
        var token: NotificationToken?
        // Read from realm
        try! realm.write {
            realm.write()
        }

        //  Set up the listener & observe object notifications.
        token = realm.observe { change in
            switch change {
            case .change(let properties):
                for property in properties {
                    print("Property '(property.name)' changed to '(property.newValue!)'");
                }
            case .error(let error):
                print("An error occurred: (error)")
            case .deleted:
                print("The object was deleted.")
            }
        }
         */
            ZStack {
                var num = Int.random(in: 1..<5140)
                Button("Next") {
                }.offset(x: 130, y:380)
                //.onTapGesture(perform: <#T##() -> Void#>)
                CardFront(degree: $frontDeg, textContext: data[num].Question)
                CardBack(degree: $backDeg, textContext:  data[num].Answer)
            }.onTapGesture {
                flipCard()
            }
        

    }
    
    func flipCard() {

        isFlipped.toggle()

        if isFlipped{
            withAnimation(.linear(duration: durationAndDelay)) {
                backDeg = 90

            }
            withAnimation(.linear(duration: durationAndDelay)) {
                frontDeg = 0
            }

        } else {
            withAnimation(.linear(duration: durationAndDelay)) {
                frontDeg = -90

            }
            withAnimation(.linear(duration: durationAndDelay)) {
                backDeg = 0
            }

        }


    }






}


struct QuizView_Previews: PreviewProvider {
    static var previews: some View {
        QuizView()
    }
}

//
//  DataLoader.swift
//  newApp
//
//  Created by Zhen Hong Tan on 11/6/22.
//

import Foundation

public class DataLoader {
    @Published var userData = [UserData]()
    
    init() {
        load()
        sort()
        removeUnknown()
        check()
    }
    func load() {
        if let fileLocation = Bundle.main.url(forResource: "Data", withExtension: "json") {
            do {
                let data = try Data(contentsOf: fileLocation)
                let jsonDecoder = JSONDecoder()
                let dataFromJson = try jsonDecoder.decode([UserData].self, from: data)
                
                self.userData = dataFromJson
            } catch {

                print(error)
            }
        }
    }
    
    func sort() {
        self.userData = self.userData.sorted(by: { $0.Chapter < $1.Chapter})
    }
    
    func removeUnknown() {
        var num = 0
        var bck = self.userData.count - 1
        while(num < self.userData.count && num < bck) {
            if(userData[num].Answer == "unknown") {
                let st = userData[num]
                userData[num] = userData[bck]
                userData[bck] = st
                bck -= 1
            } else {
                num += 1
            }
        }
        print(num)
    }
    
    func check() {
        var num = 0
        while(num < 5140) {
           // print(userData[num].Answer)
            num += 1
        }
    }
    
}

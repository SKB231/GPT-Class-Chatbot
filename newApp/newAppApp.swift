//
//  newAppApp.swift
//  newApp
//
//  Created by Neha Lalani on 9/27/22.
//

import SwiftUI

@main
struct newAppApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    var body: some Scene {
        WindowGroup {
            LogIn()
        }
    }
}

//
//  ViewController.swift
//  TextField
//
//  Created by Alvin Fabrio on 2/24/23.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var textView: UITextView!
    @IBOutlet weak var textField: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }

    @IBAction func send(_ sender: UIButton) {
        let mtext: String = textField.text!
        textView.text += mtext + "\n"
    }
    
}


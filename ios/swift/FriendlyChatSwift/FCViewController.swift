//
//  Copyright (c) 2015 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

import UIKit
import Photos

import FirebaseDatabase
import FirebaseApp
import FirebaseAuth
import Firebase.AdMob
import Firebase.Config
import Firebase.Core
import Firebase.CrashReporting

@objc(FCViewController)
class FCViewController: UIViewController, UITableViewDataSource, UITableViewDelegate,
    UITextFieldDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {

  // Instance variables
  @IBOutlet weak var textField: UITextField!
  @IBOutlet weak var sendButton: UIButton!
  var ref: Firebase!
  var messages: [FDataSnapshot]! = []
  var msglength: NSNumber = 10
  private var _refHandle: FirebaseHandle!

  var storageRef: FIRStorage!;

  @IBOutlet weak var banner: GADBannerView!
  @IBOutlet weak var clientTable: UITableView!

  @IBAction func didSendMessage(sender: UIButton) {
    textFieldShouldReturn(textField)
  }

  @IBAction func didPressCrash(sender: AnyObject) {
    withVaList([]) {
      FCRLogv("Cause Crash button clicked", $0)
    }
    fatalError()
  }

  override func viewDidLoad() {
    super.viewDidLoad()

    ref = Firebase.init(url: FIRContext.sharedInstance().serviceInfo.databaseURL)
    loadAd()
    self.clientTable.registerClass(UITableViewCell.self, forCellReuseIdentifier: "tableViewCell")
    fetchConfig()
    configureStorage()

    // Log that the view did load, FCRNSLogv is used here so the log message will be
    // shown in the console output. If FCRLogv is used the message is not shown in
    // the console output.
    withVaList([]) {
      FCRNSLogv("View loaded", $0)
    }
  }

  func loadAd() {
    self.banner.adUnitID = FIRContext.sharedInstance().adUnitIDForBannerTest
    self.banner.rootViewController = self
    self.banner.loadRequest(GADRequest())
  }

  func fetchConfig() {
    let completion:RCNDefaultConfigCompletion = {(config:RCNConfig!, status:RCNConfigStatus, error:NSError?) in
      if let error = error {
        // There has been an error fetching the config
        print("Error fetching config: \(error.localizedDescription)")
      } else {
        // Parse your config data
        self.msglength = config.numberForKey("friendly_msg_length", defaultValue: 10)
        print("Friendly msg length config: \(self.msglength)")
      }
    }

    let customVariables = ["build": "dev"]
    // 43200 secs = 12 hours
    RCNConfig.fetchDefaultConfigWithExpirationDuration(43200, customVariables: customVariables,
      completionHandler: completion)
  }

  func configureStorage() {
    let app = FIRFirebaseApp.app()
    // Configure manually with a storage bucket.
    let bucket = "YOUR_PROJECT.storage.firebase.com"
    storageRef = FIRStorage.init(app: app!, bucketName: bucket)
  }

  func textField(textField: UITextField, shouldChangeCharactersInRange range: NSRange, replacementString string: String) -> Bool {
    guard let text = textField.text else { return true }

    let newLength = text.utf16.count + string.utf16.count - range.length
    return newLength <= self.msglength.integerValue // Bool
  }

  override func viewWillAppear(animated: Bool) {
    self.messages.removeAll()
    // Listen for new messages in the Firebase database
    _refHandle = self.ref.childByAppendingPath("messages").observeEventType(.ChildAdded, withBlock: { (snapshot) -> Void in
      self.messages.append(snapshot)
      self.clientTable.insertRowsAtIndexPaths([NSIndexPath(forRow: self.messages.count-1, inSection: 0)], withRowAnimation: UITableViewRowAnimation.Automatic)
    })
  }

  override func viewWillDisappear(animated: Bool) {
    self.ref.removeObserverWithHandle(_refHandle)
  }

  // UITableViewDataSource protocol methods
  func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return messages.count
  }

  func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    // Dequeue cell
    let cell: UITableViewCell! = self.clientTable .dequeueReusableCellWithIdentifier("tableViewCell", forIndexPath: indexPath)
    // Unpack message from Firebase DataSnapshot
    let messageSnapshot: FDataSnapshot! = self.messages[indexPath.row]
    let message = messageSnapshot.value as! Dictionary<String, String>
    let name = message[Constants.MessageFields.name] as String!
    if let imageUrl = message[Constants.MessageFields.imageUrl] {
      storageRef.childByAppendingString(imageUrl).dataWithCompletion(){ (data, error) in
        if let error = error {
          print("Error downloading: \(error)")
          return
        }
        cell.imageView?.image = UIImage.init(data: data)
      }
      cell!.textLabel?.text = "sent by: \(name)"
    } else {
      let text = message[Constants.MessageFields.text] as String!
      cell!.textLabel?.text = name + ": " + text
      cell!.imageView?.image = UIImage(named: "ic_account_circle")
      if let photoUrl = message[Constants.MessageFields.photoUrl] {
        if let url = NSURL(string:photoUrl) {
          if let data = NSData(contentsOfURL: url) {
            cell!.imageView?.image = UIImage(data: data)
          }
        }
      }

    }
    return cell!
  }

  // UITextViewDelegate protocol methods
  func textFieldShouldReturn(textField: UITextField) -> Bool {
    let data = [Constants.MessageFields.text: textField.text! as String]
    sendMessage(data)
    return true
  }

  func sendMessage(var data: [String: String]) {
    data[Constants.MessageFields.name] = AppState.sharedInstance.displayName
    if let photoUrl = AppState.sharedInstance.photoUrl {
      data[Constants.MessageFields.photoUrl] = photoUrl.absoluteString
    }
    // Push data to Firebase Database
    self.ref.childByAppendingPath("messages").childByAutoId().setValue(data)
  }

  // MARK: - Image Picker

  @IBAction func didTapAddPhoto(sender: AnyObject) {
    let picker = UIImagePickerController()
    picker.delegate = self
    if (UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.Camera)) {
      picker.sourceType = UIImagePickerControllerSourceType.Camera
    } else {
      picker.sourceType = UIImagePickerControllerSourceType.PhotoLibrary
    }

    presentViewController(picker, animated: true, completion:nil)
  }

  func imagePickerController(picker: UIImagePickerController,
    didFinishPickingMediaWithInfo info: [String : AnyObject]) {
      picker.dismissViewControllerAnimated(true, completion:nil)

      let referenceUrl = info[UIImagePickerControllerReferenceURL] as! NSURL
      let assets = PHAsset.fetchAssetsWithALAssetURLs([referenceUrl], options: nil)
      let asset = assets.firstObject
      asset?.requestContentEditingInputWithOptions(nil, completionHandler: { (contentEditingInput, info) in
        let imageFile = contentEditingInput?.fullSizeImageURL?.absoluteString
        let fileName = AppState.sharedInstance.displayName! + referenceUrl.lastPathComponent!
        let metadata = FIRStorageMetadata()
        metadata.contentType = "image/jpeg"
        self.storageRef.childByAppendingString(fileName)
          .putFile(imageFile!, metadata: metadata) { (metadata, error) in
            if let error = error {
              print("Error uploading: \(error.description)")
              return
            }
            self.sendMessage([Constants.MessageFields.imageUrl: imageFile!])
          }
      })
  }

  func imagePickerControllerDidCancel(picker: UIImagePickerController) {
    picker.dismissViewControllerAnimated(true, completion:nil)
  }

  @IBAction func signOut(sender: UIButton) {
    let firebaseAuth = FIRAuth.auth()
    do {
      try firebaseAuth?.signOut()
      AppState.sharedInstance.signedIn = false
      performSegueWithIdentifier(Constants.Segues.FpToSignIn, sender: nil)
    } catch let signOutError as NSError {
      print ("Error signing out: %@", signOutError)
    }
  }

  func showAlert(title:String, message:String) {
    dispatch_async(dispatch_get_main_queue()) {
        let alert = UIAlertController(title: title,
            message: message, preferredStyle: .Alert)
        let dismissAction = UIAlertAction(title: "Dismiss", style: .Destructive, handler: nil)
        alert.addAction(dismissAction)
        self.presentViewController(alert, animated: true, completion: nil)
    }
  }

}

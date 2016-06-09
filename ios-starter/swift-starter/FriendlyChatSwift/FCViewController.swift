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

import Photos
import UIKit

import Firebase
import GoogleMobileAds

/**
 * AdMob ad unit IDs are not currently stored inside the google-services.plist file. Developers
 * using AdMob can store them as custom values in another plist, or simply use constants. Note that
 * these ad units are configured to return only test ads, and should not be used outside this sample.
 */
let kBannerAdUnitID = "ca-app-pub-3940256099942544/2934735716"

@objc(FCViewController)
class FCViewController: UIViewController, UITableViewDataSource, UITableViewDelegate,
    UITextFieldDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {

  // Instance variables
  @IBOutlet weak var textField: UITextField!
  @IBOutlet weak var sendButton: UIButton!
  var ref: FIRDatabaseReference!
  var messages: [FIRDataSnapshot]! = []
  var msglength: NSNumber = 10
  private var _refHandle: FIRDatabaseHandle!

  var storageRef: FIRStorageReference!
  var remoteConfig: FIRRemoteConfig!

  @IBOutlet weak var banner: GADBannerView!
  @IBOutlet weak var clientTable: UITableView!


  override func viewDidLoad() {
    super.viewDidLoad()

    self.clientTable.registerClass(UITableViewCell.self, forCellReuseIdentifier: "tableViewCell")

    configureDatabase()
    configureStorage()
    configureRemoteConfig()
    fetchConfig()
    loadAd()
    logViewLoaded()
  }

  deinit {
  }

  func configureDatabase() {
  }

  func configureStorage() {
  }

  func configureRemoteConfig() {
  }

  func fetchConfig() {
  }

  @IBAction func didPressFreshConfig(sender: AnyObject) {
    fetchConfig()
  }

  @IBAction func didSendMessage(sender: UIButton) {
    textFieldShouldReturn(textField)
  }

  @IBAction func didPressCrash(sender: AnyObject) {
    fatalError()
  }

  func logViewLoaded() {
  }

  func loadAd() {
  }

  func textField(textField: UITextField, shouldChangeCharactersInRange range: NSRange, replacementString string: String) -> Bool {
    guard let text = textField.text else { return true }

    let newLength = text.utf16.count + string.utf16.count - range.length
    return newLength <= self.msglength.integerValue // Bool
  }

  // UITableViewDataSource protocol methods
  func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return messages.count
  }

  func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    // Dequeue cell
    let cell: UITableViewCell! = self.clientTable.dequeueReusableCellWithIdentifier("tableViewCell", forIndexPath: indexPath)

    return cell!
  }

  // UITextViewDelegate protocol methods
  func textFieldShouldReturn(textField: UITextField) -> Bool {
    let data = [Constants.MessageFields.text: textField.text! as String]
    sendMessage(data)
    return true
  }

  func sendMessage(data: [String: String]) {
    var mdata = data
    mdata[Constants.MessageFields.name] = AppState.sharedInstance.displayName
    if let photoUrl = AppState.sharedInstance.photoUrl {
      mdata[Constants.MessageFields.photoUrl] = photoUrl.absoluteString
    }
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

    // if it's a photo from the library, not an image from the camera
    if #available(iOS 8.0, *), let referenceUrl = info[UIImagePickerControllerReferenceURL] {
      let assets = PHAsset.fetchAssetsWithALAssetURLs([referenceUrl as! NSURL], options: nil)
      let asset = assets.firstObject
      asset?.requestContentEditingInputWithOptions(nil, completionHandler: { (contentEditingInput, info) in
        let imageFile = contentEditingInput?.fullSizeImageURL
        let filePath = "\(FIRAuth.auth()?.currentUser?.uid)/\(Int(NSDate.timeIntervalSinceReferenceDate() * 1000))/\(referenceUrl.lastPathComponent!)"
      })
    } else {
      let image = info[UIImagePickerControllerOriginalImage] as! UIImage
      let imageData = UIImageJPEGRepresentation(image, 0.8)
      let imagePath = FIRAuth.auth()!.currentUser!.uid +
        "/\(Int(NSDate.timeIntervalSinceReferenceDate() * 1000)).jpg"
    }
  }

  func imagePickerControllerDidCancel(picker: UIImagePickerController) {
    picker.dismissViewControllerAnimated(true, completion:nil)
  }

  @IBAction func signOut(sender: UIButton) {
    AppState.sharedInstance.signedIn = false
    dismissViewControllerAnimated(true, completion: nil)
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

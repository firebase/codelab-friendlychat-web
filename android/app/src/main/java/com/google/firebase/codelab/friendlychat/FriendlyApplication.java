package com.google.firebase.codelab.friendlychat;

import android.app.Application;

import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;

/**
 * Created by kirill on 12/12/2016.
 */
public class FriendlyApplication extends Application {
    private static FriendlyApplication mApplicationInstance;

    public FriendlyApplication() {
        mApplicationInstance = this;
    }

    public static FriendlyApplication getInstance() { return mApplicationInstance; }

    @Override
    public void onCreate() {
        super.onCreate();

        // Initialize the SDK before executing any other operations,
        FacebookSdk.sdkInitialize(getApplicationContext());
        AppEventsLogger.activateApp(this);
    }
}

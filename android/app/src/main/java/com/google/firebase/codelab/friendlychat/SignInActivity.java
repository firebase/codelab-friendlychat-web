/**
 * Copyright Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.firebase.codelab.friendlychat;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.android.gms.measurement.AppMeasurement;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseUser;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.ui.GoogleAuthProvider;
import com.google.firebase.auth.ui.SignInUIBuilder;


public class SignInActivity extends AppCompatActivity {

    private static final String TAG = "SignInActivity";
    private static final String SERVER_CLIENT_ID = "YOUR_SERVER_CLIENT_ID";
    private FirebaseAuth mFirebaseAuth;
    private AppMeasurement mAppMeasurement;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_in);

        FirebaseApp.initializeApp(this, getString(R.string.google_app_id));

        mAppMeasurement = AppMeasurement.getInstance(this);

        mFirebaseAuth = FirebaseAuth.getAuth();
        mFirebaseAuth.addAuthResultCallback(new FirebaseAuth.AuthResultCallbacks() {
            @Override
            public void onAuthenticated(FirebaseUser firebaseUser) {
                Log.d(TAG, "Signed in via " + firebaseUser.getProviders().get(0) + " as " + firebaseUser.getDisplayName());
                Bundle payload = new Bundle();
                payload.putString(AppMeasurement.Param.VALUE, "success");
                mAppMeasurement.logEvent(AppMeasurement.Event.LOGIN, payload);
                startActivity(new Intent(SignInActivity.this, MainActivity.class));
                mFirebaseAuth.removeAuthResultCallback(this);
                finish();
            }

            @Override
            public void onAuthenticationError(com.google.firebase.FirebaseError firebaseError) {
                Log.e(TAG, "Sign in error: " + firebaseError.getErrorCode());
                Bundle payload = new Bundle();
                // TODO(arthurthompson): No sign of this value in Firebase console, confirm whether or not the payload of a
                // LOGIN event is ignored.
                payload.putString(AppMeasurement.Param.VALUE, "failed");
                mAppMeasurement.logEvent(AppMeasurement.Event.LOGIN, payload);
                mFirebaseAuth.removeAuthResultCallback(this);
            }
        });

        Button button = (Button) findViewById(R.id.button);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                SignInUIBuilder builder = new SignInUIBuilder(mFirebaseAuth);
                Intent intent = builder
                        .setServerClientId(SERVER_CLIENT_ID)
                        .supportSignIn(GoogleAuthProvider.getDefaultAuthProvider())
                        .build(SignInActivity.this);
                SignInActivity.this.startActivity(intent);

            }
        });
    }
}

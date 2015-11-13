/**
 * Copyright Google Inc. All Rights Reserved.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.firebase.codelab.friendlychat;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.text.Editable;
import android.text.InputFilter;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.firebase.client.Firebase;
import com.firebase.ui.FirebaseRecyclerViewAdapter;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.appinvite.AppInvite;
import com.google.android.gms.appinvite.AppInviteInvitation;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.config.Config;
import com.google.android.gms.config.ConfigApi;
import com.google.android.gms.config.ConfigStatusCodes;
import com.google.android.gms.measurement.AppMeasurement;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseUser;
import com.google.firebase.auth.FirebaseAuth;

import de.hdodenhof.circleimageview.CircleImageView;

public class MainActivity extends AppCompatActivity implements GoogleApiClient.OnConnectionFailedListener {

    public static class MessageViewHolder extends RecyclerView.ViewHolder {
        public TextView mMessageTextView;
        public TextView mMessengerTextView;
        public CircleImageView mMessengerImageView;

        public MessageViewHolder(View v) {
            super(v);
            mMessageTextView = (TextView) itemView.findViewById(R.id.messageTextView);
            mMessengerTextView = (TextView) itemView.findViewById(R.id.messengerTextView);
            mMessengerImageView = (CircleImageView) itemView.findViewById(R.id.messengerImageView);
        }
    }

    private static final String TAG = "MainActivity";
    public static final String MESSAGES_CHILD = "messages";
    private static final int REQUEST_INVITE = 1;
    public static final int DEFAULT_MSG_LENGTH_LIMIT = 10;
    public static final String ANONYMOUS = "anonymous";
    public static final String FIREBASE_DB_URL = "YOUR_DB_URL";
    private static final String SIGN_OUT_EVENT = "sign_out";
    private static final String MESSAGE_SENT_EVENT = "message_sent";
    private String mUsername;
    private String mPhotoUrl;
    private SharedPreferences mSharedPreferences;

    private Button mSendButton;
    private RecyclerView mMessageRecyclerView;
    private LinearLayoutManager mLinearLayoutManager;
    private FirebaseRecyclerViewAdapter<FriendlyMessage, MessageViewHolder> mFirebaseAdapter;
    private ProgressBar mProgressBar;
    private Firebase mFirebaseDatabase;
    private EditText mMessageEditText;
    private AppMeasurement mAppMeasurement;
    private GoogleApiClient mClient;
    private AdView mAdView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize FirebaseApp, this allows database calls on behalf of the signed in user.
        FirebaseApp.initializeApp(this, getString(R.string.google_app_id));
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        mUsername = ANONYMOUS;

        // Check if the user is signed in, if not redirect to the SignInActivity.
        // TODO(arthurthompson): Launch SignInActivity with startActivityForResult.
        if (!isSignedIn()) {
            startActivity(new Intent(this, SignInActivity.class));
            finish();
            return;
        }

        // Check if the InstanceID token, required to receive GCM messages has been retrieved, start registration
        // service if not yet retrieved.
        if (!mSharedPreferences.getBoolean(CodelabPreferences.INSTANCE_ID_TOKEN_RETRIEVED, false)) {
            startService(new Intent(this, RegistrationIntentService.class));
        }

        FirebaseAuth firebaseAuth = FirebaseAuth.getAuth();
        if (firebaseAuth.getCurrentUser() != null) {
            // FirebaseUser properties may be null, only it's ID is guaranteed to be non null.
            FirebaseUser firebaseUser = firebaseAuth.getCurrentUser();
            if (firebaseUser.getDisplayName() != null) {
                mUsername = firebaseUser.getDisplayName();
            } else if (firebaseUser.getEmail() != null) {
                mUsername = firebaseUser.getEmail();
            } else {
                mUsername = firebaseUser.getUserId();
            }
            if (firebaseAuth.getCurrentUser().getPhotoUrl() != null) {
                mPhotoUrl = firebaseAuth.getCurrentUser().getPhotoUrl().toString();
            }
        }


        mProgressBar = (ProgressBar) findViewById(R.id.progressBar);
        mMessageRecyclerView = (RecyclerView) findViewById(R.id.messageRecyclerView);
        mLinearLayoutManager = new LinearLayoutManager(this);
        mLinearLayoutManager.setStackFromEnd(true);

        mFirebaseDatabase = new Firebase(FIREBASE_DB_URL);
        mFirebaseAdapter = new FirebaseRecyclerViewAdapter<FriendlyMessage, MessageViewHolder>(
                        FriendlyMessage.class,
                        R.layout.item_message,
                        MessageViewHolder.class,
                        mFirebaseDatabase.child(MESSAGES_CHILD)) {

            @Override
            protected void populateViewHolder(MessageViewHolder viewHolder, FriendlyMessage friendlyMessage, int position) {
                mProgressBar.setVisibility(ProgressBar.INVISIBLE);
                viewHolder.mMessageTextView.setText(friendlyMessage.getMsg());
                viewHolder.mMessengerTextView.setText(friendlyMessage.getUser());
                if (friendlyMessage.getPhotoUrl() == null) {
                    viewHolder.mMessengerImageView.setImageDrawable(ContextCompat.getDrawable(MainActivity.this,
                            R.drawable.ic_account_circle_black_36dp));
                } else {
                    Glide.with(MainActivity.this)
                            .load(friendlyMessage.getPhotoUrl())
                            .into(viewHolder.mMessengerImageView);
                }
            }
        };

        mFirebaseAdapter.registerAdapterDataObserver(new RecyclerView.AdapterDataObserver() {
            @Override
            public void onItemRangeInserted(int positionStart, int itemCount) {
                super.onItemRangeInserted(positionStart, itemCount);
                int friendlyMessageCount = mFirebaseAdapter.getItemCount();
                int lastVisiblePosition = mLinearLayoutManager.findLastCompletelyVisibleItemPosition();
                // If the recycler view is initially being loaded or the user is at the bottom of the list, scroll
                // to the bottom of the list to show the newly added message.
                if (lastVisiblePosition == -1 ||
                        (positionStart >= (friendlyMessageCount - 1) && lastVisiblePosition == (positionStart - 1))) {
                    mMessageRecyclerView.scrollToPosition(positionStart);
                }
            }
        });

        mMessageRecyclerView.setLayoutManager(mLinearLayoutManager);
        mMessageRecyclerView.setAdapter(mFirebaseAdapter);

        // Initialize and request AdMob ad.
        mAdView = (AdView) findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder().build();
        mAdView.loadAd(adRequest);

        // Initialize Firebase Measurement.
        mAppMeasurement = AppMeasurement.getInstance(this);

        // Initialize Google Api Client and retrieve config.
        mClient = new GoogleApiClient.Builder(this)
                .addApi(Config.API)
                .addApi(AppInvite.API)
                .enableAutoManage(this, this)
                .build();
        fetchConfig();

        mMessageEditText = (EditText) findViewById(R.id.messageEditText);
        mMessageEditText.setFilters(new InputFilter[]{new InputFilter.LengthFilter(mSharedPreferences
                .getInt(CodelabPreferences.FRIENDLY_MSG_LENGTH, DEFAULT_MSG_LENGTH_LIMIT))});
        mMessageEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {
            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                if (charSequence.toString().trim().length() > 0) {
                    mSendButton.setEnabled(true);
                } else {
                    mSendButton.setEnabled(false);
                }
            }

            @Override
            public void afterTextChanged(Editable editable) {
            }
        });

        mSendButton = (Button) findViewById(R.id.sendButton);
        mSendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                FriendlyMessage friendlyMessage = new FriendlyMessage(mMessageEditText.getText().toString(), mUsername,
                        mPhotoUrl);
                mFirebaseDatabase.child(MESSAGES_CHILD).push().setValue(friendlyMessage);
                mMessageEditText.setText("");
                mAppMeasurement.logEvent(MESSAGE_SENT_EVENT, null);
            }
        });
    }

    @Override
    public void onPause() {
        if (mAdView != null) {
            mAdView.pause();
        }
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (mAdView != null) {
            mAdView.resume();
        }
    }

    @Override
    public void onDestroy() {
        if (mAdView != null) {
            mAdView.destroy();
        }
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.sign_out_menu:
                signOut();
                return true;
            case R.id.invite_menu:
                sendInvitation();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void sendInvitation() {
        Intent intent = new AppInviteInvitation.IntentBuilder(getString(R.string.invitation_title))
                .setMessage(getString(R.string.invitation_message))
                .setCallToActionText(getString(R.string.invitation_cta))
                .build();
        startActivityForResult(intent, REQUEST_INVITE);
    }

    private void signOut() {
        FirebaseAuth.getAuth().signOut(this);
        startActivity(new Intent(this, SignInActivity.class));
        mAppMeasurement.logEvent(SIGN_OUT_EVENT, null);
        finish();
    }

    private boolean isSignedIn() {
        return FirebaseAuth.getAuth().getCurrentUser() != null;
    }

    // Fetch the config to determine the allowed length of messages.
    public void fetchConfig() {
        ConfigApi.FetchConfigRequest request = new ConfigApi.FetchConfigRequest.Builder()
                .setCacheExpirationSeconds(0)
                .build();

        Config.ConfigApi.fetchConfig(mClient, request)
                .setResultCallback(new ResultCallback<ConfigApi.FetchConfigResult>() {
                    @Override
                    public void onResult(ConfigApi.FetchConfigResult fetchConfigResult) {
                        Log.d(TAG, "onResult");
                        if (fetchConfigResult.getStatus().isSuccess()) {
                            applyRetrievedLengthLimit(fetchConfigResult);
                        } else {
                            // There has been an error fetching the config
                            Log.w(TAG, "Error fetching config: " +
                                    fetchConfigResult.getStatus().toString());
                            if (fetchConfigResult.getStatus().getStatusCode() == ConfigStatusCodes.FETCH_THROTTLED) {
                                // use cached config
                                applyRetrievedLengthLimit(fetchConfigResult);
                            } else {
                                // apply restriction
                                mMessageEditText.setFilters(new InputFilter[]{new InputFilter.LengthFilter(DEFAULT_MSG_LENGTH_LIMIT)});
                            }
                        }
                    }
                });
    }

    @Override
    public void onConnectionFailed(ConnectionResult status) {
        Log.w(TAG, "failed: " + status);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Log.d(TAG, "onActivityResult: requestCode=" + requestCode + ", resultCode=" + resultCode);

        if (requestCode == REQUEST_INVITE) {
            if (resultCode == RESULT_OK) {
                // Check how many invitations were sent and log.
                String[] ids = AppInviteInvitation.getInvitationIds(resultCode, data);
                Log.d(TAG, "Invitations sent: " + ids.length);
            } else {
                // Sending failed or it was canceled, show failure message to the user
                Log.d(TAG, "Failed to send invitation.");
            }
        }
    }

    /**
     * Apply retrieved length limit to edit text field. This result may be fresh from the server or it may be from
     * cached values.
     */
    private void applyRetrievedLengthLimit(ConfigApi.FetchConfigResult fetchConfigResult) {
        // get value from result
        Long friendly_msg_length = fetchConfigResult.getAsLong("friendly_msg_length", DEFAULT_MSG_LENGTH_LIMIT, "configns:firebase");
        mMessageEditText.setFilters(new InputFilter[]{new InputFilter.LengthFilter(friendly_msg_length.intValue())});
        Log.d(TAG, "FML is: " + friendly_msg_length);
    }

}

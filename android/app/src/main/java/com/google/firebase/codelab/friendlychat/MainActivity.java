package com.google.firebase.codelab.friendlychat;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
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

import com.firebase.client.ChildEventListener;
import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.FirebaseError;
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
import com.google.codelab.friendlychat2.R;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity implements GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener {

    private static final String TAG = "MainActivity";
    public static final String SIGNED_IN = "signedIn";
    private static final int REQUEST_INVITE = 1;
    public static final int MSG_LIMIT = 10;
    public static final String ANONYMOUS = "anonymous";
    public static final String FIREBASE_DB_URL = "https://friendly-chat-4be09.firebaseio-staging.com/messages";
    private String mUsername;
    private SharedPreferences mSharedPreferences;

    private Button mSendButton;
    private RecyclerView mMessageRecyclerView;
    private LinearLayoutManager mLinearLayoutManager;
    private MessageAdapter mMessageAdapter;
    private ProgressBar mProgressBar;
    private Firebase mFirebase;
    private EditText mMessageEditText;
    private AppMeasurement mAppMeasurement;
    private GoogleApiClient mClient;
    private AdView mAdView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        FirebaseApp.initializeApp(this, getString(R.string.google_app_id));
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        /**
         * The check for sign in here is commented since I was unable to get it working, once Firebear is working as
         * expected this check can be replaced.
         */
        if (!isSignedIn()) {
            startActivity(new Intent(this, SignInActivity.class));
            finish();
            return;
        }

        mProgressBar = (ProgressBar) findViewById(R.id.progressBar);

        FirebaseAuth firebaseAuth = FirebaseAuth.getAuth();
        if (firebaseAuth.getCurrentUser() != null) {
            mUsername = firebaseAuth.getCurrentUser().getDisplayName();
        } else {
            mUsername = ANONYMOUS;
        }
        mMessageRecyclerView = (RecyclerView) findViewById(R.id.messageRecyclerView);
        mLinearLayoutManager = new LinearLayoutManager(this);
        mLinearLayoutManager.setReverseLayout(true);
        mMessageAdapter = new MessageAdapter(new ArrayList<FriendlyMessage>());
        mMessageRecyclerView.setLayoutManager(mLinearLayoutManager);
        mMessageRecyclerView.setAdapter(mMessageAdapter);

        mAdView = (AdView) findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder().build();
        mAdView.loadAd(adRequest);

        mAppMeasurement = AppMeasurement.getInstance(this);
        mClient = new GoogleApiClient.Builder(this, this, this)
                .addApi(Config.API)
                .addApi(AppInvite.API)
                .enableAutoManage(this, this)
                .build();

        Firebase.setAndroidContext(this);
        mFirebase = new Firebase(FIREBASE_DB_URL);
        mFirebase.addChildEventListener(new ChildEventListener() {
                @Override
                public void onChildAdded(DataSnapshot dataSnapshot, String s) {
                    mProgressBar.setVisibility(ProgressBar.INVISIBLE);
                    mMessageAdapter.getFriendlyMessages().add(0, dataSnapshot.getValue(FriendlyMessage.class));
                    mMessageAdapter.notifyItemInserted(0);
                    mMessageRecyclerView.scrollToPosition(0);
                }

                @Override
                public void onChildChanged(DataSnapshot dataSnapshot, String s) {

                }

                @Override
                public void onChildRemoved(DataSnapshot dataSnapshot) {

                }

                @Override
                public void onChildMoved(DataSnapshot dataSnapshot, String s) {

                }

                @Override
                public void onCancelled(FirebaseError firebaseError) {
                    Log.d(TAG, "Error");
                }
            });

        mMessageEditText = (EditText) findViewById(R.id.messageEditText);
        mMessageEditText.setFilters(new InputFilter[]{new InputFilter.LengthFilter(MSG_LIMIT)});
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
                FriendlyMessage friendlyMessage = new FriendlyMessage(mMessageEditText.getText().toString(), mUsername);
                mFirebase.push().setValue(friendlyMessage);
                mMessageEditText.setText("");
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
        // Handle item selection
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
        mSharedPreferences.edit().putBoolean(SIGNED_IN, false).apply();
        FirebaseAuth.getAuth().signOut(this);
        startActivity(new Intent(this, SignInActivity.class));
        finish();
    }

    // TODO(arthurthompson): Use best practice to determine signed in state. May be using getCurrentUser != null
    private boolean isSignedIn() {
        return mSharedPreferences.getBoolean(SIGNED_IN, false);
    }

    // TODO(arthurthompson): If config does not push any conditional values to server use authEnabled and move
    // the config fetch to onCreate.
    public void onConnected(Bundle connectionHint) {
        Log.d(TAG, "onConnected");
        ConfigApi.FetchConfigRequest request = new ConfigApi.FetchConfigRequest.Builder()
                .build();

        Config.ConfigApi.fetchConfig(mClient, request)
                .setResultCallback(new ResultCallback<ConfigApi.FetchConfigResult>() {
                    @Override
                    public void onResult(ConfigApi.FetchConfigResult fetchConfigResult) {
                        Log.d(TAG, "onResult");
                        if (fetchConfigResult.getStatus().isSuccess()) {
                            applyRetrievedConfig(fetchConfigResult);
                        } else {
                            // There has been an error fetching the config
                            Log.w(TAG, "Error fetching config: " +
                                    fetchConfigResult.getStatus().toString());
                            if (fetchConfigResult.getStatus().getStatusCode() == ConfigStatusCodes.FETCH_THROTTLED) {
                                // use cached config
                                applyRetrievedConfig(fetchConfigResult);
                            } else {
                                // apply restriction
                                mMessageEditText.setFilters(new InputFilter[]{new InputFilter.LengthFilter(MSG_LIMIT)});
                            }
                        }
                    }
                });
    }

    @Override
    public void onConnectionSuspended(int cause) {
        Log.w(TAG, "suspended: " + cause);
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
                // Check how many invitations were sent and log a message
                // The ids array contains the unique invitation ids for each invitation sent
                // (one for each contact select by the user). You can use these for analytics
                // as the ID will be consistent on the sending and receiving devices.
                String[] ids = AppInviteInvitation.getInvitationIds(resultCode, data);
                Log.d(TAG, "Invitations sent: " + ids.length);
            } else {
                // Sending failed or it was canceled, show failure message to the user
                Log.d(TAG, "Failed to send invitation.");
            }
        }
    }

    private int getMyMessageCount() {
        int count = 0;
        if (!mUsername.equals(ANONYMOUS)) {
            for (FriendlyMessage friendlyMessage : mMessageAdapter.getFriendlyMessages()) {
                if (friendlyMessage.getUser().equals(mUsername)) {
                    count++;
                }
            }
        }
        return count;
    }

    private void applyRetrievedConfig(ConfigApi.FetchConfigResult fetchConfigResult) {
        // get value from cache
        long extremeFriendlyLevel = fetchConfigResult.getAsLong("extreme_friendly_level", MSG_LIMIT, "configns:firebase");
        String welcomeMsg = fetchConfigResult.getAsString("welcome_message", "Friendly Welcome!", "configns:firebase");
        if (getMyMessageCount() >= extremeFriendlyLevel) {
            // remove restriction
            mMessageEditText.setFilters(new InputFilter[0]);
        } else {
            // apply restriction
            mMessageEditText.setFilters(new InputFilter[]{new InputFilter.LengthFilter(MSG_LIMIT)});
        }
        Log.d(TAG, "EFL is: " + extremeFriendlyLevel);
        Log.d(TAG, "Welcome msg is: " + welcomeMsg);
    }

 }

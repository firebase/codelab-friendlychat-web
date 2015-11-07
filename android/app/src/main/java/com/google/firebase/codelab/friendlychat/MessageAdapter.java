package com.google.firebase.codelab.friendlychat;

import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.google.codelab.friendlychat2.R;

import java.util.Collections;
import java.util.List;

// TODO(arthurthompson): Try FirebaseUI
public class MessageAdapter extends RecyclerView.Adapter<MessageAdapter.ViewHolder> {

    private List<FriendlyMessage> mFriendlyMessages;

    public static class ViewHolder extends RecyclerView.ViewHolder {
        public TextView mMessageTextView;
        public TextView mMessengerTextView;

        public ViewHolder(View v) {
            super(v);
            mMessageTextView = (TextView) itemView.findViewById(R.id.messageTextView);
            mMessengerTextView = (TextView) itemView.findViewById(R.id.messengerTextView);
        }
    }

    public MessageAdapter(List<FriendlyMessage> friendlyMessages) {
        mFriendlyMessages = friendlyMessages;
    }

    public ViewHolder onCreateViewHolder(ViewGroup viewGroup, int viewType) {
        View v = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.item_message, viewGroup, false);

        return new ViewHolder(v);
    }

    public void onBindViewHolder(ViewHolder viewHolder, final int position) {
        viewHolder.mMessageTextView.setText(mFriendlyMessages.get(position).getMsg());
        viewHolder.mMessengerTextView.setText(mFriendlyMessages.get(position).getUser());
    }

    public int getItemCount() {
        return mFriendlyMessages.size();
    }

    public List<FriendlyMessage> getFriendlyMessages() {
        return mFriendlyMessages;
    }

    public void setFriendlyMessages(List<FriendlyMessage> friendlyMessages) {
        mFriendlyMessages = friendlyMessages;
        Collections.reverse(mFriendlyMessages);
    }
}

package com.google.firebase.codelab.friendlychat;


public class FriendlyMessage {

    // TODO(arthurthompson): Add picture and id fields.
    private String msg;
    private String user;

    public FriendlyMessage() {
    }

    public FriendlyMessage(String msg, String user) {
        this.msg = msg;
        this.user = user;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
}

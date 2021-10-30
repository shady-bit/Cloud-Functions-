const functions = require('firebase-functions');
const admin = require('firebase-admin');
 
admin.initializeApp(functions.config().functions);

var db = admin.firestore();

exports.newMessageTrigger = functions.firestore.document('ChatRooms/{chatRoomId}/Chats/{chatDocId}').onCreate(async(snapshot,context) => {
    if(snapshot.empty){
        console.log("No Data");
        return;
    }
    var newData = snapshot.data();

    
    var ChatRoomId = context.params.chatRoomId;
    console.log(`ChatRoomId: ${ChatRoomId}`);
    var uid1 = ChatRoomId.substring(0,ChatRoomId.indexOf('_'));
    var uid2 = ChatRoomId.substring(ChatRoomId.indexOf('_')+1,ChatRoomId.length);
    var msg = snapshot.data() ["message"];
    var sentByUID = snapshot.data()["sendBy"];
    
    console.log(`Message: ${msg}`);
    console.log(`UID1: ${uid1}`);
    console.log(`UID2: ${uid2}`);
    
    var token;
    var nameWhoSent;
    var senderProfileImg;
    var uidToSend;
    var phone;


    await db.collection("Profile").doc(sentByUID).get().then(snapshot  => {
        nameWhoSent = snapshot.data()["name"];
        senderProfileImg = snapshot.data()["profilePic"];
        uidToSend = snapshot.data()["uid"];
        phone = snapshot.data()["phone"];
    });


    if(snapshot.data()["sendBy"] == uid1){
        await db.collection("Profile").doc(uid2).get().then( snapshot => {
            token = snapshot.data()["deviceToken"];
            // console.log(snapshot.data());
            console.log(`Token: ${token}`);
        });
    }else{
        await db.collection("Profile").doc(uid1).get().then( snapshot => {
            token = snapshot.data()["deviceToken"];
            // console.log(snapshot.data());
            console.log(`Token: ${token}`);
        });
    }

        var payLoad = {
            notification: {
                title: nameWhoSent,
                body: msg,
                icon: "ic_notification",
                sound: 'default',
                android_channel_id: "high_importance_channel",
                priority:  "high",
                // image: senderProfileImg,
                tag: ChatRoomId,
            },
            data:{
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                message: "message",
                uid: uidToSend,
                tag: 'chat',
                phone: phone,
                name: nameWhoSent,
                profilePic: senderProfileImg,
                chatRoomId: ChatRoomId,
            }
        }

    
    try {
        const response =  await admin.messaging().sendToDevice(token,payLoad);
        console.log("Nofification Sent Successfully");

    }catch(e){
        console.log("Error sending notification");
    }

});



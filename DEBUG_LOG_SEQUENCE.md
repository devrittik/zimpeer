# Debug Log Sequence for Mic-Only Enable

## Expected Log Sequence When User Clicks Mic Toggle

Run this test with both participants already in the room. Open browser DevTools console on **both caller and receiver**.

### STEP 1: User Clicks Mic (Caller Side)
```
[DEBUG] getUserMedia(audio) SUCCESS
[DEBUG] DEBUG: newAudioTrack obtained: <track-id> true
[DEBUG] Total peer connections: 1
[DEBUG] Peer <receiver-id> has audio sender: false
[DEBUG] ADD TRACK for peer <receiver-id>
[DEBUG] Peers needing renegotiation: [<receiver-id>]
[DEBUG] Step 3: createOffer for peer <receiver-id>
[DEBUG] Step 3b: setLocalDescription with offer for <receiver-id>
[DEBUG] Step 4: Emitting signal (offer) to peer <receiver-id>
[DEBUG] Step 4b: Signal emitted to peer <receiver-id>
```

### STEP 2: Backend Relays Offer
```
[RELAY] Signal from <caller-id> to <receiver-id>, type=offer
```

### STEP 3: Receiver Receives Offer (Receiver Side)
```
[DEBUG] Step 5: OFFER received from <caller-id>, state=stable
[DEBUG] Step 5a: setRemoteDescription for offer from <caller-id>
[DEBUG] Step 5b: createAnswer for <caller-id>
[DEBUG] Step 5c: setLocalDescription with answer for <caller-id>
[DEBUG] Step 6: Emitting ANSWER back to <caller-id>
[DEBUG] Step 6b: Answer emitted to <caller-id>
```

### STEP 4: Backend Relays Answer
```
[RELAY] Signal from <receiver-id> to <caller-id>, type=answer
```

### STEP 5: Caller Receives Answer (Caller Side)
```
[DEBUG] Step 7: ANSWER received from <receiver-id>, state=have-local-offer
[DEBUG] Step 7a: setRemoteDescription for answer from <receiver-id>
[DEBUG] Step 7b: Signaling complete with <receiver-id>
```

### STEP 6: Remote Tracks Delivered (Both Sides)
```
[DEBUG] ICE candidate for <remote-id>
[DEBUG] Step 9: ontrack fired from <remote-id>, track kind=audio, state=live
[DEBUG] Step 9a: Stream from <remote-id> has tracks: audio:true
[DEBUG] Step 9b: Existing video entry for <remote-id>: true
[DEBUG] Step 9c: Updated stream for <remote-id> in videos array
```

---

## What to Watch For

| Step | Expected Log | Issue if Missing |
|------|--------------|------------------|
| 1 | `getUserMedia(audio) SUCCESS` | Permission denied or network issue |
| 2 | `Total peer connections: 1` | Not connected to remote peer |
| 2 | `ADD TRACK for peer <id>` | addTrack not called (critical!) |
| 3 | `createOffer for peer <id>` | Didn't create renegotiation offer |
| 4 | `Signal emitted to peer <id>` | Offer not sent |
| 4 | `[RELAY]` message | Backend not relaying |
| 5 | `OFFER received from <id>` | Remote didn't receive offer |
| 6 | `ANSWER received` | Answer didn't come back |
| 9 | `ontrack fired` | **Remote never gets audio track!** |
| 9a | `track kind=audio` | Wrong track type |
| 9c | `Updated stream` | Stream updated in video array |

---

## Test Procedure

1. **Start app normally** - both users join room
2. **Enable mic** (click mic button while camera is off)
3. **Watch both consoles simultaneously**
4. **Note first missing log** - that's the break point

## Common Failure Points

### Missing "Step 3" logs
- createOffer is not being called
- Likely: pcsToRenegotiateAudio array is empty → no peers marked for renegotiation

### Missing "Step 5" logs  
- Offer never arrived at remote
- Check backend [RELAY] log was sent
- Issue: socket.io relay broken or wrong socket ID

### Missing "Step 9" logs
- ontrack never fired = remote PC never received audio
- Issue: ICE gathering incomplete or answer handling broken

### ontrack fires but says "audio:false"
- Audio track received but not enabled
- Check: `audioTrackRef.current.enabled = true` in enableMedia

---

## Share These Three Logs With First Missing Step:

1. **Caller console output** (copy all [DEBUG] logs)
2. **Backend console output** (copy all [RELAY] logs)  
3. **Receiver console output** (copy all [DEBUG] logs)

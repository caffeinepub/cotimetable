import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

import Nat "mo:core/Nat";

actor {
  include MixinStorage();

  type UserProfileInternal = {
    principal : Principal;
    displayName : Text;
    timeZone : Text;
  };

  public type UserProfile = {
    principal : Principal;
    displayName : Text;
    timeZone : Text;
  };

  public type RegisterResult = {
    #success;
    #alreadyRegistered;
    #invalidInput;
    #anonymousCaller;
    #slotFull;
  };

  public type Message = {
    sender : Principal;
    content : Text;
    file : (?Storage.ExternalBlob);
    fileName : ?Text;
    mimeType : ?Text;
    timestamp : Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var userProfiles = Map.empty<Principal, UserProfileInternal>();
  var messages = List.empty<Message>();

  // Timetable types and state
  public type Recurrence = {
    #none;
    #weekday;
    #weekend;
  };

  public type TimetableEntry = {
    id : Nat;
    day : Text;
    startTime : Int;
    endTime : Int;
    title : Text;
    recurrence : Recurrence;
  };

  public type TimetableEntryInput = {
    day : Text;
    startTime : Int;
    endTime : Int;
    title : Text;
    recurrence : Recurrence;
  };

  var timetableEntries = Map.empty<Principal, List.List<TimetableEntry>>();
  var nextEntryId = 1;

  func isRegisteredUser(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // Admin-only: reset the entire system state
  public shared ({ caller }) func resetSystem(passcode : Text) : async Bool {
    if (passcode != "161189") {
      Runtime.trap("Unauthorized: Only authorized admins can reset");
    };

    userProfiles := Map.empty<Principal, UserProfileInternal>();
    messages := List.empty<Message>();
    timetableEntries := Map.empty<Principal, List.List<TimetableEntry>>();
    true;
  };

  public shared ({ caller }) func register(displayName : Text, timeZone : Text) : async RegisterResult {
    if (caller.isAnonymous()) {
      return #anonymousCaller;
    };
    if (displayName.size() == 0 or displayName.size() > 30) {
      return #invalidInput;
    };
    switch (userProfiles.get(caller)) {
      case (?_) {
        return #alreadyRegistered;
      };
      case (null) {
        if (userProfiles.size() >= 2) {
          return #slotFull;
        };
        let userProfile : UserProfileInternal = {
          principal = caller;
          displayName;
          timeZone;
        };
        userProfiles.add(caller, userProfile);
        return #success;
      };
    };
  };

  public shared ({ caller }) func sendMessage(content : Text, file : ?Storage.ExternalBlob, fileName : ?Text, mimeType : ?Text) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can send messages");
    };

    let message : Message = {
      sender = caller;
      content;
      file;
      fileName;
      mimeType;
      timestamp = Time.now();
    };
    messages.add(message);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can get their profile");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        ?{
          principal = profile.principal;
          displayName = profile.displayName;
          timeZone = profile.timeZone;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(displayName : Text, timeZone : Text) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can save their profile");
    };
    if (displayName.size() == 0 or displayName.size() > 30) {
      Runtime.trap("Display name cannot be empty or longer than 30 characters");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found; please register first") };
      case (?existing) {
        let updated : UserProfileInternal = {
          principal = existing.principal;
          displayName;
          timeZone;
        };
        userProfiles.add(caller, updated);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (?profile) {
        ?{
          principal = profile.principal;
          displayName = profile.displayName;
          timeZone = profile.timeZone;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can get messages");
    };
    messages.toArray();
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can view user profiles");
    };
    let profilesInternal = userProfiles.values().toArray();
    profilesInternal.map<UserProfileInternal, UserProfile>(
      func(profile) {
        {
          principal = profile.principal;
          displayName = profile.displayName;
          timeZone = profile.timeZone;
        };
      }
    );
  };

  public shared ({ caller }) func addTimetableEntry(entryInput : TimetableEntryInput) : async TimetableEntry {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can add timetable entries");
    };

    if (entryInput.title.size() == 0 or entryInput.title.size() > 200) {
      Runtime.trap("Title must not be empty and cannot exceed 200 characters");
    };

    let entries = switch (timetableEntries.get(caller)) {
      case (?existing) { existing };
      case (null) {
        let newEntries = List.empty<TimetableEntry>();
        timetableEntries.add(caller, newEntries);
        newEntries;
      };
    };

    let newEntry = {
      id = nextEntryId;
      day = entryInput.day;
      startTime = entryInput.startTime;
      endTime = entryInput.endTime;
      title = entryInput.title;
      recurrence = entryInput.recurrence;
    };

    entries.add(newEntry);
    nextEntryId += 1;
    newEntry;
  };

  public shared ({ caller }) func updateTimetableEntry(entryId : Nat, updatedInput : TimetableEntryInput) : async TimetableEntry {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can update timetable entries");
    };

    switch (timetableEntries.get(caller)) {
      case (?entries) {
        let updatedEntries = entries.map<TimetableEntry, TimetableEntry>(
          func(entry) {
            if (entry.id == entryId) {
              {
                id = entryId;
                day = updatedInput.day;
                startTime = updatedInput.startTime;
                endTime = updatedInput.endTime;
                title = updatedInput.title;
                recurrence = updatedInput.recurrence;
              };
            } else {
              entry;
            };
          }
        );

        let entryResult = updatedEntries.find(
          func(entry) {
            entry.id == entryId;
          }
        );

        switch (entryResult) {
          case (?updatedEntry) {
            timetableEntries.add(caller, updatedEntries);
            updatedEntry;
          };
          case (null) { Runtime.trap("Timetable entry not found") };
        };
      };
      case (null) { Runtime.trap("No timetable entries found for caller") };
    };
  };

  public shared ({ caller }) func deleteTimetableEntry(entryId : Nat) : async () {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can delete timetable entries");
    };

    switch (timetableEntries.get(caller)) {
      case (?entries) {
        let originalSize = entries.size();
        let filteredEntries = entries.filter(
          func(entry) { entry.id != entryId }
        );

        if (filteredEntries.size() == originalSize) {
          Runtime.trap("Timetable entry not found");
        };

        timetableEntries.add(caller, filteredEntries);
      };
      case (null) { Runtime.trap("No timetable entries found for caller") };
    };
  };

  public query ({ caller }) func getAllCallerTimetableEntries() : async [TimetableEntry] {
    if (not isRegisteredUser(caller)) {
      Runtime.trap("Unauthorized: Only registered users can get timetable entries");
    };

    switch (timetableEntries.get(caller)) {
      case (?entries) {
        entries.toArray();
      };
      case (null) { [] };
    };
  };
};

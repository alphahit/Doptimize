import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
export default function TimeTask({navigation}) {
  //FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
  const [users, setUsers] = useState([]); // State to store user data
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [completeTable, setCompleteTable] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };
  // Fetch user data from Firestore when the component first mounts.

  const fetchUsers = async () => {
    // This function will handle the process of fetching user data from Firestore.

    try {
      const querySnapshot = await firestore().collection('Users').get();
      // Here, firestore() initializes the Firestore instance.
      // .collection('Users') refers to the 'Users' collection in your Firestore database.
      // .get() is an asynchronous method that fetches the data from the 'Users' collection.
      // The await keyword waits for the .get() operation to complete before moving on to the next line.
      // The result of this operation is stored in querySnapshot, which contains the data retrieved from Firestore.

      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // querySnapshot.docs is an array of document snapshots, where each snapshot represents a document.
      // .map() is a JavaScript array method used to transform each element in an array.
      // For each document (doc) in querySnapshot.docs, we create a new object.
      // doc.id is the document's unique ID in Firestore.
      // doc.data() is a method that returns the data of the document as an object.
      // The spread operator (...) is used to include all the fields from doc.data() in the new object.
      // As a result, usersData becomes an array of user objects, each containing the document ID and its data.

      setUsers(usersData);
      // This line updates the users state with the array of user objects we obtained from Firestore.
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const fetchTimeTable = async () => {
    try {
      const querySnapshot = await firestore().collection('Time Table').get();
      const timeData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to JavaScript Date object, then to a string
        const timeString = data.time
          ? data.time.toDate().toString()
          : 'No time';
        return {
          id: doc.id,
          activity: data.activity,
          time: timeString,
        };
      });
      setCompleteTable(timeData);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };
  const submitForm = () => {
    // Handle the form submission, e.g., save the data
    console.log('Activity:', activity);
    console.log('Time:', date);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    fetchTimeTable();
    fetchUsers();
  }, []);
  useEffect(() => {
    fetchTimeTable();
    fetchUsers();
  }, [refreshing]);

  const addUser = async userData => {
    try {
      await firestore().collection('Users').add(userData);
      console.log('User added!');
    } catch (error) {
      console.error('Error writing user to Firestore:', error);
    }
  };
  const addTimeTable = async timetabledata => {
    try {
      // Convert JavaScript Date to Firestore Timestamp before storing
      const timestamp = firestore.Timestamp.fromDate(timetabledata.time);
      await firestore()
        .collection('Time Table')
        .add({
          ...timetabledata,
          time: timestamp,
        });
      console.log('Time Table Data added!');
    } catch (error) {
      console.error('Error writing to Firestore:', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollcontainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Text>Time Tasks</Text>
        {users.map((user, index) => (
          <View key={index} style={styles.userItem}>
            <Text>Name: {user.name}</Text>
            {/* Add more user details here if needed */}
          </View>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            addUser({
              name: 'Jane Doe',
              email: 'janedoe@example.com',
              age: 28,
            })
          }>
          <Text>Add User</Text>
        </TouchableOpacity>
        <View style={{}}>
          <TextInput
            style={styles.input}
            placeholder="Enter activity"
            value={activity}
            onChangeText={setActivity}
          />
          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={() => setShow(true)}>
              <Text>Show time picker</Text>
            </TouchableOpacity>
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              addTimeTable({time: date, activity: activity});
            }}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
        {completeTable.map((activity, index) => (
          <View key={index} style={styles.userItem}>
            <Text>Activity: {activity.activity}</Text>
            <Text>Time: {activity.time}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Details')}>
          <Text>Open Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollcontainer: {
    backgroundColor: 'black',
    flex: 1,
  },
  userItem: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
});

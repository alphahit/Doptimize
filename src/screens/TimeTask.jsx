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
import Inputs from '../components/Inputs';
export default function TimeTask({navigation}) {
  //FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
  const [users, setUsers] = useState([]); // State to store user data
  const [activity, setActivity] = useState('');
  const [displayTime, setDisplayTime] = useState('')
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [completeTable, setCompleteTable] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const onChange = (event, selectedDate) => {





   


    setShow(false);
    let timeString = selectedDate.getHours().toString().padStart(2, '0') + ':' + selectedDate.getMinutes().toString().padStart(2, '0');
    console.log(timeString)
    setActivity({...activity, time: timeString})
    setDisplayTime(timeString)
 

  };

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
      const timeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompleteTable(timeData);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setActivity('');
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
      // Format the time as a string (e.g., "15:30" for 3:30 PM)
      // const timeString =
      //   timetabledata.time.getHours().toString().padStart(2, '0') +
      //   ':' +
      //   timetabledata.time.getMinutes().toString().padStart(2, '0');
      //   setDisplayTime(timeString)
      console.log("timetabledata ======>",timetabledata)
      //await firestore().collection('Time Table').add(timetabledata);
      console.log('Time Table Data added!');
    } catch (error) {
      console.error('Error writing to Firestore:', error);
    }
  };
  const onChangeInput = (text, field) => {
    setActivity({...activity, [field]:text});
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollcontainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
      
        <View style={{}}>

          <Inputs 
          placeholder={'Enter Activity'}
          label="Activity"
          name='activity'
          onChangeHnadler={text=>onChangeInput(text,'activity')}
          />
          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={() => setShow(true)}>
              <Text>Show time picker</Text>
            </TouchableOpacity>
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={time}
                mode="time" // Ensure this is set to 'time'
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}
          </View>
          <Text style={{backgroundColor:"pink"}}>{displayTime}</Text>
          <TouchableOpacity
            onPress={() => {
              addTimeTable(activity);
            }}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
        {completeTable.map((item, index) => (
          <View key={index} style={styles.userItem}>
            <Text>Activity: {item.activity}</Text>
            <Text>Time: {item.time}</Text>
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

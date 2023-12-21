import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Animated,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Inputs from '../components/Inputs';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/Ionicons';

export default function TimeTask({navigation}) {
  //FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
  //const [users, setUsers] = useState([]); // State to store user data
  const [activity, setActivity] = useState('');
  const [displayTime, setDisplayTime] = useState('');
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const [completeTable, setCompleteTable] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const onChange = (event, selectedDate) => {
    setShow(false);
    let timeString =
      selectedDate.getHours().toString().padStart(2, '0') +
      ':' +
      selectedDate.getMinutes().toString().padStart(2, '0');
    console.log(timeString);
    setActivity({...activity, time: timeString});
    setDisplayTime(timeString);
  };
  const deleteItem = async (itemId) => {
    try {
      // Delete from Firestore
      await firestore().collection('Time Table').doc(itemId).delete();
      console.log('Item deleted!');
  
      // Update local state
      setCompleteTable(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    addTimeTable(activity); // call your function here
  };
  const animatedStyle = {
    transform: [{scale: scaleValue}],
  };
  useEffect(() => {
    console.log('Activity ===========>', activity);
  }, [activity]);

  // const fetchUsers = async () => {
  //   // This function will handle the process of fetching user data from Firestore.

  //   try {
  //     const querySnapshot = await firestore().collection('Users').get();
  //     // Here, firestore() initializes the Firestore instance.
  //     // .collection('Users') refers to the 'Users' collection in your Firestore database.
  //     // .get() is an asynchronous method that fetches the data from the 'Users' collection.
  //     // The await keyword waits for the .get() operation to complete before moving on to the next line.
  //     // The result of this operation is stored in querySnapshot, which contains the data retrieved from Firestore.

  //     const usersData = querySnapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     // querySnapshot.docs is an array of document snapshots, where each snapshot represents a document.
  //     // .map() is a JavaScript array method used to transform each element in an array.
  //     // For each document (doc) in querySnapshot.docs, we create a new object.
  //     // doc.id is the document's unique ID in Firestore.
  //     // doc.data() is a method that returns the data of the document as an object.
  //     // The spread operator (...) is used to include all the fields from doc.data() in the new object.
  //     // As a result, usersData becomes an array of user objects, each containing the document ID and its data.

  //     setUsers(usersData);
  //     // This line updates the users state with the array of user objects we obtained from Firestore.
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // };
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
    // fetchUsers();
  }, []);
  useEffect(() => {
    fetchTimeTable();

    //fetchUsers();
  }, [refreshing]);

  // const addUser = async userData => {
  //   try {
  //     await firestore().collection('Users').add(userData);
  //     console.log('User added!');
  //   } catch (error) {
  //     console.error('Error writing user to Firestore:', error);
  //   }
  // };
  const addTimeTable = async timetabledata => {
    try {
      // Format the time as a string (e.g., "15:30" for 3:30 PM)
      // const timeString =
      //   timetabledata.time.getHours().toString().padStart(2, '0') +
      //   ':' +
      //   timetabledata.time.getMinutes().toString().padStart(2, '0');
      //   setDisplayTime(timeString)
      console.log('timetabledata ======>', timetabledata);
      await firestore().collection('Time Table').add(timetabledata);
      console.log('Time Table Data added!');
    } catch (error) {
      console.error('Error writing to Firestore:', error);
    }
  };
  const onChangeInput = (text, field) => {
    console.log('onChangeInput=======>', text.nativeEvent.text, field);
    setActivity({...activity, [field]: text.nativeEvent.text});
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollcontainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
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

        <Inputs
          placeholder={'Enter Task'}
          label="Task"
          name="task"
          onChangeHandler={text => onChangeInput(text, 'task')}
          bgColor="#e1f3f8"
          outlined
          placeholderTextColor="#000"
        />

        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShow(true)}>
          <View style={{flexDirection:"row", alignItems:'center'}}>
            <Ionicons name="time-sharp" size={24} color={'red'} />
            <Text
              style={{
                marginLeft: 8,
                color: 'white',
                fontSize: 16,
              }}>
              Time
            </Text>
          </View>

          {displayTime !== '' && (
            <Text style={styles.displayTime}>{displayTime}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={animatePress}>
          <Animated.View style={[styles.button, animatedStyle]}>
            <Text style={styles.textWhite}>Submit</Text>
          </Animated.View>
        </TouchableOpacity>

        {completeTable.map((item, index) => (
  <View key={index} style={styles.userItem}>
    <View>
      <Text style={styles.textWhite}>Activity: {item.task}</Text>
      <Text style={styles.textWhite}>Time: {item.time}</Text>
    </View>
    <TouchableOpacity onPress={() => deleteItem(item.id)}>
      <Ionicons name="remove-circle" size={24} color={'red'} />
    </TouchableOpacity>
  </View>
))}
        {/* <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Details')}>
          <Text style={styles.textWhite}>Open Details</Text>
        </TouchableOpacity> */}
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
    padding: 10,
  },

  userItem: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
  },
  button: {
    backgroundColor: '#4CAF50', // Example color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWhite: {
    color: 'white',
    fontSize: 16,
  },
  pickerContainer: {
    padding: 10,
    backgroundColor: '#6200EE', // Example vibrant color
    borderRadius: 4,
    elevation: 4, // Shadow effect
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  displayTime: {
    backgroundColor: 'black',
    color: 'white',
    padding: 8,
    borderRadius: 4,
  },
});

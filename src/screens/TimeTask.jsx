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
  Dimensions 
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import Inputs from '../components/Inputs';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import DraggableFlatList from 'react-native-draggable-flatlist';

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
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
const RPH = (percentage) => {
return (percentage / 100) * screenHeight; 
};
const RPW = (percentage) => {
  return (percentage / 100) * screenWidth;
};
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
  const deleteItem = async itemId => {
    try {
      // Delete from Firestore
      await firestore().collection('Time Table').doc(itemId).delete();
      console.log('Item deleted!');

      // Update local state
      setCompleteTable(prevItems =>
        prevItems.filter(item => item.id !== itemId),
      );
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

  const addTimeTable = async timetabledata => {
    try {
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
      <View style={styles.scrollcontainer}>
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShow(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
          <TouchableOpacity onPress={animatePress} style={{}}>
            <Animated.View style={[styles.button, animatedStyle]}>
              <Text style={styles.textWhite}>Submit</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <DraggableFlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={completeTable}
          renderItem={({item, drag, isActive}) => (
            <TouchableOpacity
              onLongPress={drag}
              style={[
                styles.userItem,
                {backgroundColor: isActive ? 'grey' : 'black'},
              ]}>
              <View>
                <Text style={styles.textWhite}>Activity: {item.task}</Text>
                <Text style={styles.textWhite}>Time: {item.time}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Ionicons name="remove-circle" size={24} color={'red'} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `draggable-item-${item.id}`}
          onDragEnd={({data}) => setCompleteTable(data)}
        />

        {/* <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Details')}>
          <Text style={styles.textWhite}>Open Details</Text>
        </TouchableOpacity> */}
      </View>
      <TouchableOpacity style={{position:'absolute', bottom:10, marginLeft: RPW(45)}} onPress={onRefresh}><Ionicons name="refresh-circle" size={40} color={'red'} /></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  
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
    alignItems: 'center',
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

    flex: 0.9,
  },
  displayTime: {
    backgroundColor: 'black',
    color: 'white',
    padding: 8,
    borderRadius: 4,
    maxHeight: 40,
  },
});

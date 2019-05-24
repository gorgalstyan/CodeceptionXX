/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { FlatList, StyleSheet, View, Text, SafeAreaView, Platform, DeviceEventEmitter, Linking } from 'react-native';
import Beacons from 'react-native-beacons-manager';
import { ListItem, Image } from 'react-native-elements'

import moment from 'moment'

import getRoomsAvailabilityData from './services/availability'
import TimeSelector from './components/TimeSelector';

const roomsData = require('./fixtures/CA-KM-MeetingRooms.json')

const regex = /capacity/ig;

// const rooms = roomsData.map(rd => rd.Id).map(rd => {
//   const parts = rd.Name.split(regex) || []
//   const sub = parts[1];
//   return {
//     ...rd,
//     title: parts[0] || rd.Name,
//     subTitle: (sub && `Capacity ${sub}`) || '',
//   };
// });

function getRoomData(id) {
  const roomData = roomsData[id];
  const parts = roomData.Name.split(regex) || []
  const sub = parts[1];
  return {
    ...roomData,
    title: parts[0] || roomData.Name,
    subTitle: (sub && `Capacity ${sub}`) || '',
  };
};

let allRooms = null;
function getAllRooms() {
  if (allRooms) return allRooms;

  allRooms = [];
  for (const key in roomsData) {
    const roomData = roomsData[key];
    const parts = roomData.Name.split(regex) || []
    const sub = parts[1];
    allRooms.push({
      ...roomData,
      title: parts[0] || roomData.Name,
      subTitle: (sub && `Capacity ${sub}`) || '',
    });
  }
  return allRooms;
};

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    const mmt = moment();
    const mmtMidnight = mmt.clone().startOf('day');
    let currentMins = mmt.diff(mmtMidnight, 'minutes');
    currentMins = Math.floor(currentMins / 15) * 15;

    this.initialStartTime = currentMins;
    this.initialEndTime = currentMins + 60;

    this.state = {
      foundRooms: {},
      startTime: this.initialStartTime,
      endTime: this.initialEndTime,
    }
  }

  componentWillMount() {
    Beacons.requestWhenInUseAuthorization();
    // console.log('found becons', data);
    Beacons.startRangingBeaconsInRegion({ identifier: 'Thanks', uuid: 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825' });
    Beacons.startUpdatingLocation();
    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      let newFoundRooms = {};
      data.beacons.forEach(element => {
        newFoundRooms = this.state.foundRooms;
        newFoundRooms[element.major] = {
          proximity: element.proximity,
          distance: element.accuracy ? element.accuracy.toFixed(2) : 20,
          ...getRoomData(element.major)
        }
        // console.log('found rooms', newFoundRooms);
        const roomArray = Object.keys(newFoundRooms).map(i => newFoundRooms[i])
        this.setState({
          foundRooms: newFoundRooms,
          roomArray: roomArray
        });
      });
      // console.log('found beacons', this.state.foundRooms);
    });
  }

  componentDidMount() {
    getRoomsAvailabilityData().then(availability => {
      this.setState({
        availability,
      })
    })
  }

  componentWillUnMount() {
    this.beaconsDidRange = null;
  }

  onTimeValueChange(val) {
    const { startTime, endTime } = val;
    this.setState({ startTime, endTime });
  }

  onPress(item, event) {
    const { startTime } = this.state;
    const atTime = moment(0, 'HH').add(startTime, 'm')
    if(Platform.OS === 'ios') {
      const referenceDate = moment.utc('2001-01-01');
      const secondsSinceRefDate = atTime.unix() - referenceDate.unix();
      // Linking.openURL('calshow:' + secondsSinceRefDate);
      Linking.openURL('x-apple-calevent://' + secondsSinceRefDate);
    } else if(Platform.OS === 'android') {
      const msSinceEpoch = atTime.valueOf(); // milliseconds since epoch
      Linking.openURL('content://com.android.calendar/time/' + msSinceEpoch);
    }
  }

  keyExtractor = (item, index) => item.EmailAddress;

  renderItem = ({ item }) => {
    const { startTime, endTime, availability } = this.state;
    const meetings = {};
    if (availability) {
      const doy = moment().dayOfYear();
      const roomId = item.EmailAddress;
      const roomAvailability = (availability[roomId] || {})[doy];
      if (roomAvailability) {
        for (let time = startTime; time < endTime; time += 5) {
          const mi = roomAvailability[time];
          if (mi) {
            meetings[mi.id] = mi;
          }
        }
      }
    }
    return (
      <ListItem onPress={event => this.onPress(item, event)}
        title={
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ fontSize: 16 }}>{item.subTitle}</Text>
          </View>
        }
        // subtitle={item.subTitle}
        subtitle={
          <View>
            {Object.values(meetings).map(mi =>
              (<Text key={mi.id} style={{ paddingTop: 3 }} >{`${mi.subject} ${mi.start.format("h:mma")}-${mi.end.format("h:mma")}`}</Text>))}
          </View>
        }
        // rightTitle={meetingsText}
        rightSubtitle={item.distance ? `${item.distance}m` : null}
        // leftAvatar={{ source: { uri: item.avatar_url } }}
        bottomDivider={true}
      />
    )
  }

  render() {
    const rooms = Object.keys(this.state.foundRooms).length > 0 ? this.state.roomArray : getAllRooms();
    return (
      <SafeAreaView style={styles.droidSafeArea}>
        <Image source={require('./res/iconSpark.png')} style={{height: 50, width: 50, alignSelf: 'center'}}/>
        <TimeSelector initialStartTime={this.initialStartTime} initialEndTime={this.initialEndTime}
          onChange={val => this.onTimeValueChange(val)} />
        <FlatList
          keyExtractor={this.keyExtractor}
          data={rooms}
          extraData={this.state}
          renderItem={this.renderItem}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    // backgroundColor: npLBlue,
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
});

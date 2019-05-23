/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native';

import { ListItem } from 'react-native-elements'
import Slider from '@react-native-community/slider';

import moment from 'moment'

const roomsData = require('./fixtures/CA-KM-MeetingRooms.json')

const regex = /capacity/ig;

const rooms = roomsData.map(rd => rd.Id).map(rd => {
  const parts = rd.Name.split(regex) || []
  const sub = parts[1];
  return {
    ...rd,
    title: parts[0] || rd.Name,
    subTitle: (sub && `Capacity ${sub}`) || '',
  };
});

const minTime = 6*60;
const maxTime = 19*60;
const minMeetingDuration = 15;

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    const mmt = moment();
    const mmtMidnight = mmt.clone().startOf('day');
    let currentMins = mmt.diff(mmtMidnight, 'minutes');    
    currentMins = Math.floor(currentMins / 15) * 15;

    this.state = {
      startTime: currentMins,
      endTime: currentMins + 60,
    }
  }

  keyExtractor = (item, index) => item.EmailAddress;

  renderItem = ({ item }) => (
    <ListItem
      title={item.title}
      subtitle={item.subTitle}
      // leftAvatar={{ source: { uri: item.avatar_url } }}
      bottomDivider={true}
    />
  )

  onStartValueChange(val) {
    const dur = this.state.endTime - this.state.startTime;
    let startTime = val;
    let endTime = startTime + dur;
    if (endTime > maxTime) {
      endTime = maxTime;
    }
    const maxStart = endTime - minMeetingDuration;
    if (maxStart < startTime) startTime = maxStart;
    this.setState({
        startTime,
        endTime,
      }
    )
  }

  onEndValueChange(val) {
    let startTime = this.state.startTime;
    let endTime = val;
    const maxStart = endTime - minMeetingDuration;
    if (maxStart < startTime) startTime = maxStart;
    if (startTime < minTime) {
      startTime = minTime;
      endTime = startTime + minMeetingDuration;
    };
    this.setState({
        startTime,
        endTime,
      }
    )
  }

  render() {
    const startTime = this.state.startTime;
    const endTime = this.state.endTime;
    // const startTimeText = moment(0, 'HH').add(startTime, 'm').format("h:mm a");
    const startTimeText = moment(0, 'HH').add(startTime, 'm').format("h:mm a");
    const endTimeText = moment(0, 'HH').add(endTime, 'm').format("h:mm a");
    return (
      <SafeAreaView style={styles.droidSafeArea}>
        <View>
          <Text style={{padding: 10, fontSize: 20}}>{startTimeText} - {endTimeText}</Text>
          <Slider
            style={{ height: 50 }}
            value={this.state.startTime}
            minimumValue={minTime}
            maximumValue={maxTime}
            step={5}
            onValueChange={val => this.onStartValueChange(val)}
          />
          <Slider
            style={{ height: 50 }}
            value={this.state.endTime}
            minimumValue={minTime}
            maximumValue={maxTime}
            step={5}
            onValueChange={val => this.onEndValueChange(val)}
          />
        </View>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={rooms}
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

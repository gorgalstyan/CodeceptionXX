import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

import moment from 'moment'

const minTime = 7 * 60;
const maxTime = 19 * 60;
const minMeetingDuration = 15;

export default class TimeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startTime: props.initialStartTime,
            endTime: props.initialEndTime,
        };
    }

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

    onSlidingComplete(val) {
        if (this.props.onChange) {
            this.props.onChange({
                startTime: this.state.startTime,
                endTime: this.state.endTime
            });
        }
    }

    render() {
        const { startTime, endTime } = this.state;
        const startTimeText = moment(0, 'HH').add(startTime, 'm').format("h:mm a");
        const endTimeText = moment(0, 'HH').add(endTime, 'm').format("h:mm a");
        return (
            <View>
                <Text style={{ padding: 10, fontSize: 20 }}>{startTimeText} - {endTimeText}</Text>
                <Slider
                    style={{ height: 50 }}
                    value={this.state.startTime}
                    minimumValue={minTime}
                    maximumValue={maxTime}
                    step={5}
                    onValueChange={val => this.onStartValueChange(val)}
                    onSlidingComplete={val => this.onSlidingComplete(val)}
                />
                <Slider
                    style={{ height: 50 }}
                    value={this.state.endTime}
                    minimumValue={minTime}
                    maximumValue={maxTime}
                    step={5}
                    onValueChange={val => this.onEndValueChange(val)}
                    onSlidingComplete={val => this.onSlidingComplete(val)}
                />
            </View>
        );
    }
}

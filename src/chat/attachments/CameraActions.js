import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,

  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import Camera from 'react-native-camera';
import { Actions } from 'react-native-router-flux';

// import Loading from '@components/general/Loading';
import ImageUtil from './ImageUtil';
import Group from '../../models/group';

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  typeButton: {
    padding: 5,
  },
  flashButton: {
    padding: 5,
  },
  closeButton: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: (Platform.OS === 'ios') ? 16 : 0,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    padding: 5,
    marginRight: 8,
    height: 40,
    flex: 1,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  sendButton: {
    height: 40,
    width: 40,
  },
  buttonsSpace: {
    width: 30,
  },
});

export default class CameraActions extends React.Component {
  constructor(props) {
    super(props);
    this._images = [];
    const groupId = this.props.groupId;
    this.state = {
      camera: {
        aspect: Camera.constants.Aspect.fill,
        captureTarget: Camera.constants.CaptureTarget.cameraRoll,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
        flashMode: Camera.constants.FlashMode.auto,
      },
      groupId,
      isRecording: false,
      modalPreviewVisible: false,
      modalType: null,
      cameraData: {},
      cameraMessage: '',
      uploadPercent: 0,
      closeBtn: false,
    };
    this.switchType = this.switchType.bind(this);
    this.switchFlash = this.switchFlash.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
  }

  /* eslint-disable global-require */
  get typeIcon() {
    let icon;
    const { back, front } = Camera.constants.Type;

    if (this.state.camera.type === back) {
      icon = require('./assets/ic_camera_rear_white.png');
    } else if (this.state.camera.type === front) {
      icon = require('./assets/ic_camera_front_white.png');
    }

    return icon;
  }

  get flashIcon() {
    let icon;
    const { auto, on, off } = Camera.constants.FlashMode;

    if (this.state.camera.flashMode === auto) {
      icon = require('./assets/ic_flash_auto_white.png');
    } else if (this.state.camera.flashMode === on) {
      icon = require('./assets/ic_flash_on_white.png');
    } else if (this.state.camera.flashMode === off) {
      icon = require('./assets/ic_flash_off_white.png');
    }

    return icon;
  }
  /* eslint-enable global-require */

  switchType() {
    let newType;
    const { back, front } = Camera.constants.Type;

    if (this.state.camera.type === back) {
      newType = front;
    } else if (this.state.camera.type === front) {
      newType = back;
    }

    this.setState({
      camera: {
        ...this.state.camera,
        type: newType,
      },
    });
  }

  switchFlash() {
    let newFlashMode;
    const { auto, on, off } = Camera.constants.FlashMode;

    if (this.state.camera.flashMode === auto) {
      newFlashMode = on;
    } else if (this.state.camera.flashMode === on) {
      newFlashMode = off;
    } else if (this.state.camera.flashMode === off) {
      newFlashMode = auto;
    }

    this.setState({
      camera: {
        ...this.state.camera,
        flashMode: newFlashMode,
      },
    });
  }

  startRecording() {
    if (this.camera) {
      this.camera.capture({
        audio: true,
        mode: Camera.constants.CaptureMode.video,
        target: Camera.constants.CaptureTarget.disk,
      })
          .then((data) => {
            if (!this.state.closeBtn) {
              Actions.pop();
              setTimeout(() => {
                Actions.refresh({
                  attach: {
                    cameraData: data,
                    cameraMessage: '',
                    video: false,
                  },
                });
              }, 0);
            }
          })
          .catch(err => console.error(err));
      this.setState({
        isRecording: true,
      });
    }
  }

  stopRecording() {
    if (this.camera) {
      this.camera.stopCapture();
      this.setState({
        isRecording: false,
      });
    }
  }

  captureImageAndPreview() {
    if (this.camera) {
      this.camera.capture()
        .then((data) => {
          Actions.captureImagePreview({
            group: this.props.group,
            cameraData: data,
            imageUrl: data.path,
            progressCallback: this.props.progressCallback,
            duration: 0,
          });
        }).catch(err => console.error(err));
    }
  }

  sendCameraImage() {
    const _progressCallback = this.props.progressCallback;
    new ImageUtil().uploadImage(this.state.cameraData, this.state.groupId, true, this.state.cameraMessage,
    (fuFileName, fuPercent, fuMsg) => {
      const percentage = Math.round(Number(parseFloat(fuPercent).toFixed(2) * 100));
      if (_progressCallback) {
        _progressCallback(fuFileName, fuMsg, percentage, 1, 0);
      }
    });
    Actions.pop();
  }

  sendCameraVideo() {
    const _progressCallback = this.props.progressCallback;
    new ImageUtil().uploadImage(this.state.cameraData, this.state.groupId, false, this.state.cameraMessage,
    (fuFileName, fuPercent, fuMsg) => {
      const percentage = Math.round(Number(parseFloat(fuPercent).toFixed(2) * 100));
      if (_progressCallback) {
        _progressCallback(fuFileName, fuMsg, percentage, 1, 0);
      }
    });
    Actions.pop();
  }

  /* eslint-disable global-require */
  render() {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}
          captureTarget={this.state.camera.captureTarget}
          type={this.state.camera.type}
          flashMode={this.state.camera.flashMode}
          onFocusChanged={() => {}}
          onZoomChanged={() => {}}
          defaultTouchToFocus
          mirrorImage={false}
        />
        <View style={[styles.overlay, styles.bottomOverlay]}>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={this.switchType}
          >
            <Image
              source={this.typeIcon}
            />
          </TouchableOpacity>
          <View style={styles.buttonsSpace} />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => {
              this.captureImageAndPreview();
            }}
            disabled={this.state.isRecording}
            activeOpacity={0.3}
            underlayColor={'rgba(0,0,0,0.3)'}
          >
            <Icon
              name="camera-enhance"
              size={32}
              color="#000"
              width={30}
            />
          </TouchableOpacity>
          <View style={styles.buttonsSpace} />
          {
              (!this.state.isRecording
              &&
              <TouchableOpacity
                style={styles.captureButton}
                onPress={this.startRecording}
                activeOpacity={0.3}
              >
                <Image
                  source={require('./assets/ic_videocam_36pt.png')}
                />
              </TouchableOpacity>)
              ||
              <TouchableOpacity
                style={[styles.captureButton, { backgroundColor: 'red' }]}
                onPress={this.stopRecording}
                activeOpacity={0.3}
              >
                <Image
                  source={require('./assets/ic_stop_36pt.png')}
                />
              </TouchableOpacity>
          }
          <View style={styles.buttonsSpace} />
          <TouchableOpacity
            style={styles.flashButton}
            onPress={this.switchFlash}
            activeOpacity={0.3}
          >
            <Image
              source={this.flashIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, {
            position: 'absolute',
            top: 20,
            left: 20,
          }]}
          onPress={() => {
            this.camera.stopCapture();
            this.setState({
              closeBtn: true,
            });
            Actions.pop();
          }}
        >
          <Icon
            name="close"
            size={30}
            color="#000"
            width={30}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
/* eslint-enable global-require */

CameraActions.defaultProps = {
  onSend: () => {},
  containerStyle: {},
  textStyle: {},
  group: null,
  groupId: null,
  progressCallback: () => {},
};

CameraActions.propTypes = {
  onSend: React.PropTypes.func,
  containerStyle: View.propTypes.style,
  textStyle: Text.propTypes.style,
  group: PropTypes.instanceOf(Group),
  groupId: PropTypes.string,
  progressCallback: PropTypes.func,
};
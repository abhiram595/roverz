/**
 * Login Container
 */
import { connect } from 'react-redux';
import * as UserActions from '../../redux/user/actions';

// The component we're mapping to
import LoginRender from './LoginView';

// What data from the store shall we send to the component?
const mapStateToProps = state => ({
  user: state.user,
});

// Any actions to map to the component?
const mapDispatchToProps = {
  login: UserActions.login,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginRender);

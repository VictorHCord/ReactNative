import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {ActivityIndicator} from 'react-native';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,

} from './styles';




export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    page: 1,
    user: {},
  };

  /* Vai executar automaticamente quando usuario entrar */
  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);
    this.setState({ stars: response.data , loading: false,user });


  }

  load = async(page = 1 ) => {
    const {user,stars} = this.state;
    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      star: page === 1 ? [...response.data] : [...stars, ...response.data],
      page,
    });
  }
  loadMore = async () => {
    const { page } = this.state;

    this.load(page + 1);
  };
  render() {
    const { navigation } = this.props;
    const { stars , loading} = this.state;
    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (<ActivityIndicator size={60}/>) : (
        <Stars
          onEndReachedThreshold={0.2}
          onEndReached={this.loadMore}
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) =>  (
            <Starred >
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>

          )}
        />
        )}
      </Container>
    );
  }
}

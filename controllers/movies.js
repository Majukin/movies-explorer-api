const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('../errors/ValidationError');

module.exports.createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  } = req.body;
  const { _id } = req.user;
  Movie.create({
    movieId,
    country,
    director,
    duration,
    year,
    description,
    owner: _id,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  })
    .then(() => res.status(201).send({ message: 'Фильм сохранен' }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Некорректные данные при создании фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.getMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.find({ owner: _id }).populate('owner', '_id')
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  const { id: movieId } = req.params;
  const { _id: userId } = req.user;

  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) next(new NotFoundError('Фильм не найден'));

      const { owner: movieOwnerId } = movie;
      if (movieOwnerId.valueOf() !== userId) {
        next(new ForbiddenError('Попытка удалить фильм другого пользователя'));
      }
      movie.deleteOne()
        .then(() => res.status(201).send({ message: 'Фильм удален' }))
        .catch(next);
    })
    .catch(next);
};

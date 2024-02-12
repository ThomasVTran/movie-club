const router = require("express").Router();
const { List, Movie, Review, User, Comment } = require("../models");
const withAuth = require("../utils/withAuth");
const isAdmin = require("../utils/isAdmin");

router.get (`/`, async (req, res) =>{
try {
    const listData = await List.findByPk(
        // req.params.id,
        1,
         {
        include: [
            {
                model: Movie,
                // attributes: [title, poster, rating, run_time, summary]
            },
        ],
    });

    const curatedList = listData.get({ plain: true })
    console.log(curatedList.movies);
    res.render(`homepage`, {
        ...curatedList,
        // logged_in: req.session.logged_in
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get(`/admin`, [withAuth, isAdmin], async (req, res) => {
  try {
    const lists = await List.findAll({
      include: [
        {
          model: Movie,
          attributes: [title, poster, rating, run_time, summary],
        },
      ],
    });

    const allLists = lists.get({ plain: true });

    res.render(`admin`, {
      allLists,
      logged_in: req.session.logged_in,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get(`/login`, (req, res) => {
  if (req.session.logged_in) {
    res.redirect(`/homepage`);
    return;
  } else {
    res.render(`login`);
  }
});

router.get(`/movie/:id`, 
// withAuth, 
async (req, res) => {
  try {
    const movieData = await Movie.findByPk(
        req.params.id, 
        {
      include: [
        {
          model: Review,
          //   attributes: [title, body, rating],
          include: [
            { model: User },
            { model: Comment, include: [{ model: User }] },
          ],
        },
      ],
    });

    const movieList = movieData.get({ plain: true });

    res.render(`movie`, {
      ...movieList,
      //logged_in: req.session.logged_in,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get(
  `/user`,
  // withAuth,
  async (req, res) => {
    try {
      const userData = await User.findByPk(
        // req.session.user_id,
        1,
        {
          attributes: { exclude: [`password`] },
          include: [
            // {model: Review},
            { model: Movie },
          ],
        }
      );
      const reviewData = await Review.findAll({
        where: {
          // user_id: req.session.user_id,
          user_id: 1,
        },
        include: [
          { model: Movie },
          { model: Comment, include: [{ model: User }] },
        ],
      });
      // console.log(userData);
      const user = userData.get({ plain: true });
      const reviews = reviewData.map((review) => review.get({ plain: true }));

      res.render(`user`, {
        ...user,
        reviews,
        logged_in: true,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

module.exports = router;

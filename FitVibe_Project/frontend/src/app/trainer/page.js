"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import axios from "axios";
import "./trainer.css";

import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

function WorkoutImage({ image_filename, title }) {
  const [src, setSrc] = useState(`/images/workouts/${image_filename}`);
  const handleError = () => {
    setSrc(`http://localhost:8001/static/workout_images/${image_filename}`);
  };

  return (
    <img src={src} alt={title} className="workout-image" onError={handleError} loading="lazy"/>
  );
}
const TrainerPage = () => {
  const [ime, setIme] = useState("");
  const [plans, setPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [form, setForm] = useState({
    plan_name: "",
    description: "",
    level: "",
    goal: "",
    category_id: "",
    workout_ids: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [additionalWorkouts, setAdditionalWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    description: "",
    repetitions: "",
  });
  const [usersPerPlan, setUsersPerPlan] = useState({});
  const [userCounts, setUserCounts] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const handleWorkoutToggle = (id) => {
    setForm((prev) => {
      const newWorkoutIds = [...prev.workout_ids];
      if (newWorkoutIds.includes(id)) {
        return {
          ...prev,
          workout_ids: newWorkoutIds.filter((wid) => wid !== id),
        };
      } else {
        newWorkoutIds.push(id);
        return { ...prev, workout_ids: newWorkoutIds };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError("Token not found!");
        return;
      }
      await axios.post(
        "http://localhost:8001/trainer/plans",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("The plan has been successfully created!");
      setForm({
        plan_name: "",
        description: "",
        level: "",
        goal: "",
        category_id: "",
        workout_ids: [],
      });
      await fetchPlans();
    } catch (err) {
      setError("Error creating plan.");
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("Token not found!");
        return;
      }
      const res = await axios.get(
        "http://localhost:8001/trainer/plans",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlans(res.data);
      res.data.forEach((plan) => fetchUserCount(plan.id));
    } catch (err) {
      console.error(err);
      setError("Ne mogu dohvatiti planove.");
    }
  };

  const fetchWorkouts = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get(
        "http://localhost:8001/trainer/workouts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkouts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(
        "http://localhost:8001/trainer/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlanDetail = async (planId) => {
    const token = getToken();
    if (!token) return;
    if (selectedPlanId === planId) {
      setSelectedPlanId(null);
      setSelectedWorkouts([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8001/trainer/plans/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPlanId(planId);
      setSelectedWorkouts(res.data.workouts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    Cookies.remove("trainer_id");
    Cookies.remove("first_name");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleDelete = async (planId) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8001/trainer/plans/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlans((prev) => prev.filter((plan) => plan.id !== planId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWorkout = async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) return;

  const formData = new FormData();
  formData.append("title", newWorkout.title);
  formData.append("description", newWorkout.description);
  formData.append("repetitions", newWorkout.repetitions);
  if (newWorkout.image) {
    formData.append("image", newWorkout.image);
  }

  try {
    await axios.post("http://localhost:8001/trainer/workouts", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",  
      },
    });
    setNewWorkout({ title: "", description: "", repetitions: 0, image: null });
    setSuccess("Vježba dodana!");
    await fetchWorkouts(); 
  } catch (error) {
    console.error(error);
    setError("Neuspješan upload vježbe.");
  }
};


  const handleRemoveWorkoutFromPlan = async (planId, workoutId) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8001/trainer/plans/${planId}/workouts/${workoutId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (selectedPlanId === planId) fetchPlanDetail(planId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8001/trainer/workouts/${workoutId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      if (selectedPlanId) fetchPlanDetail(selectedPlanId);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddWorkoutsToPlan = (planId) => {
    setEditingPlanId(planId);
    setAdditionalWorkouts([]);
  };

  const handleAddToExistingPlan = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.post(
        `http://localhost:8001/trainer/plans/${editingPlanId}/add_workouts`,
        { workout_ids: additionalWorkouts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Dodane vježbe!");
      setAdditionalWorkouts([]);
      setEditingPlanId(null);
      fetchPlanDetail(editingPlanId);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsersForPlan = async (planId) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:8001/trainer/plans/${planId}/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsersPerPlan((prev) => ({ ...prev, [planId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserCount = async (planId) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(
        `http://localhost:8001/trainer/plans/${planId}/user_count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserCounts((prev) => ({ ...prev, [planId]: res.data.user_count }));
    } catch (err) {
      console.error(err);
    }
  };

  const removeUserFromPlan = async (planId, userId) => {
    const token = getToken();
    if (!token) return;
    try {
      await axios.delete(
        `http://localhost:8001/trainer/plans/${planId}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsersForPlan(planId);
      fetchUserCount(planId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const storedIme = Cookies.get("first_name");
    if (storedIme) setIme(storedIme);
    fetchPlans();
    fetchWorkouts();
    fetchNotifications();
  }, []);
  

return (
  <div className="trainer-container">
    <header className="trainer-header sticky-header">
      <div className="trainer-left">
        <Link href="/trainer/profile">
          <FaUserCircle size={28} title="Profile" className="turquoise-icon" />
        </Link>

        <div className="notification-wrapper">
          <div className="notification-icon" onClick={() => setShowNotifications((prev) => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="#00dfc4" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 24c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.1-1.6-5.6-4.5-6.3V6a1.5 1.5 0 0 0-3 0v.7C7.6 7.4 6 9.9 6 13v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>

          {showNotifications && (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              {notifications.length === 0 ? (
                <p className="no-notifications">No new notifications</p>
              ) : (
                <ul className="notification-list">
                  {notifications.map((n) => (
                    <li key={n.id} className="notification-item">
                      {n.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="trainer-right">
        <button onClick={handleLogout} className="turquoise-button">Logout</button>
      </div>
    </header>



    <main className="trainer-main">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome, coach {ime}!</h1>
            <p>Plan, organize, and track your training plans and workouts easily.</p>
          </div>
          <div className="hero-cards">
            <a href="#plans" className="hero-card">
              <h3>📋 My Plans</h3>
              <p>View and manage your training plans.</p>
            </a>
            <a href="#workouts" className="hero-card">
              <h3>🏋️ Workouts</h3>
              <p>See, add and remove exercises.</p>
            </a>
            <a href="#create" className="hero-card">
              <h3>➕ Create Plan</h3>
              <p>Build a new workout plan.</p>
            </a>
          </div>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <section id="plans" className="trainer-section">
      <h2>My Plans</h2>

      {plans.length === 0 && <p>No plans available.</p>}

      {plans.length > 0 && (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div className="plan-card" key={plan.id}>
              <h3>{plan.plan_name}</h3>
              <p>{plan.description}</p>
              <p><strong>Level:</strong> {plan.level}</p>
              <p><strong>Goal:</strong> {plan.goal}</p>
              <p><strong>Category:</strong> {plan.category_id}</p>
              <p>
                <strong>Registered Users:</strong>{" "}
                {(() => {
                  if (userCounts[plan.id] !== undefined && userCounts[plan.id] !== null) {
                    return userCounts[plan.id];
                  } else {
                    return 0;
                  }
                })()}
              </p>


              <div className="plan-buttons">
                <button onClick={() => fetchPlanDetail(plan.id)}>
                  {(() => {
                    if (selectedPlanId === plan.id) {
                      return "Hide Workouts";
                    } else {
                      return "Show Workouts";
                    }
                  })()}
                </button>

                <button onClick={() => fetchUsersForPlan(plan.id)}>Show Users</button>
                <button onClick={() => handleDelete(plan.id)} className="danger">Delete</button>
              </div>

              {selectedPlanId === plan.id && (
                <div className="workout-detail">
                  <h4>Workouts in this plan:</h4>

                  {selectedWorkouts.length === 0 && <p>No workouts assigned.</p>}

                  {selectedWorkouts.length > 0 && (
                    <ul className="workout-list">
                      {selectedWorkouts.map((w) => (
                        <li key={w.id}>
                          <strong>{w.title}</strong> – {w.description} ({w.repetitions} reps)
                          <div className="workout-actions">
                            <button onClick={() => handleRemoveWorkoutFromPlan(selectedPlanId, w.id)} className="warning">
                              Remove from Plan
                            </button>
                            <button onClick={() => handleDeleteWorkout(w.id)} className="danger">
                              Delete Workout
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button onClick={() => openAddWorkoutsToPlan(plan.id)} className="button">
                    Add Workouts to this Plan
                  </button>

                  {editingPlanId === plan.id && (
                    <div className="add-workouts-panel">
                      <h4>Select additional workouts:</h4>
                      {workouts.map((w) => {
                        const isChecked = additionalWorkouts.includes(w.id);
                        return (
                          <label key={w.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setAdditionalWorkouts((prev) => {
                                  const newList = [...prev];
                                  if (newList.includes(w.id)) {
                                    return newList.filter((wid) => wid !== w.id);
                                  } else {
                                    newList.push(w.id);
                                    return newList;
                                  }
                                })
                              }
                            />
                            <span><strong>{w.title}</strong> – {w.description}</span>
                          </label>
                        );
                      })}
                      <button onClick={handleAddToExistingPlan} className="success">Confirm</button>
                    </div>
                  )}
                </div>
              )}

              {usersPerPlan[plan.id] && (
                <div className="user-list">
                  <h4>Registered Users:</h4>

                  {usersPerPlan[plan.id].length === 0 && <p>No users registered for this plan.</p>}

                  {usersPerPlan[plan.id].length > 0 && (
                    <ul>
                      {usersPerPlan[plan.id].map((user) => (
                        <li key={user.id}>
                          {user.first_name} {user.last_name} – {user.email}
                          <button
                            onClick={() => removeUserFromPlan(plan.id, user.id)}
                            className="danger"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>


    <section id="create" className="trainer-section create-section">
      <h2 className="section-title-with-icon">
        <span>🛠️</span> Create New Plan
      </h2>
      <form onSubmit={handleSubmit} className="form-card vertical-form">
        <input type="text" placeholder="Plan Name" value={form.plan_name}
            onChange={(e) => setForm({ ...form, plan_name: e.target.value })} required/>
        <textarea placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} required/>
        <input type="text" placeholder="Level" value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}/>
        <input type="text" placeholder="Goal" value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}/>
        <input type="number" placeholder="Category ID" value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}/>

        <h3>Select workouts:</h3>
        <div className="workout-grid">
          {workouts.map((w) => {
            const isChecked = form.workout_ids.includes(w.id);
            let workoutClass = "workout-card";
            if (isChecked) {
              workoutClass += " checked";
            }

            return (
              <div key={w.id} className={workoutClass}
                  onClick={() => handleWorkoutToggle(w.id)}>
                <input type="checkbox" checked={isChecked} readOnly style={{ display: "none" }} />
                <h4>{w.title}</h4>
                <WorkoutImage image_filename={w.image_filename} title={w.title} />
                <p>{w.description}</p>
                <p>
                  <em>{w.repetitions} repetitions</em>
                </p>
              </div>
            );
          })}
          </div>

          <div className="center-submit">
            <button type="submit">Create Plan</button>
          </div>
        </form>
      </section>


      <section id="workouts" className="trainer-section workout-section">
        <h2 className="section-title-with-icon">
          <span>🏋🏽‍♀️</span> Add New Workout
        </h2>
        <form onSubmit={handleAddWorkout} className="form-card vertical-form">
          <input type="text" placeholder="Workout Title" value={newWorkout.title} onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })} required/>
          <textarea placeholder="Workout Description" value={newWorkout.description} onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })} required/>
          <input type="number" placeholder="Repetitions" value={newWorkout.repetitions} onChange={(e) => setNewWorkout({ ...newWorkout, repetitions: parseInt(e.target.value) })} required/>
          <input type="file" accept="image/*" onChange={(e) => setNewWorkout({ ...newWorkout, image: e.target.files[0] })}/>
          <div className="center-submit">
            <button type="submit">Add Workout</button>
          </div>
        </form>
      </section>

    </main>

    <a href="#top" className="scroll-to-top" title="Back to top">▲</a>

  </div>


);
};

export default TrainerPage;

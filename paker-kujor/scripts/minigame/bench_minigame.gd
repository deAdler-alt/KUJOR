extends Control

@export var weight_database: WeightDatabase

@onready var weight_label: Label = $Center/VBox/WeightLabel
@onready var progress_bar: ProgressBar = $Center/VBox/ProgressBar
@onready var rep_label: Label = $Center/VBox/RepLabel
@onready var timer_label: Label = $Center/VBox/TimerLabel
@onready var hint_label: Label = $Center/VBox/HintLabel
@onready var bar_visual: ColorRect = $Center/VBox/BarVisual

const BOSS_PHASE2_DECAY_MULT := 1.3
const BOSS_PHASE2_DURATION := 10.0

var _active: bool = false
var _progress: float = 0.0
var _config: WeightConfig = null
var _time_left: float = 0.0
var _started: bool = false
var _boss_phase2: bool = false
var _boss_phase2_timer: float = 0.0
var _boss_pause: bool = false
var _boss_pause_done: bool = false
var _bar_y_offset: float = 0.0
var _was_above_zero: bool = false


func _ready() -> void:
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	if weight_database == null:
		weight_database = load("res://data/weights.tres") as WeightDatabase


func start_lift(weight_kg: int) -> void:
	var cfg := _get_config(weight_kg)
	if cfg == null:
		push_error("BenchMinigame: brak konfiguracji dla %d kg" % weight_kg)
		return
	_config = cfg
	_progress = 0.0
	_time_left = cfg.time_limit_sec
	_started = false
	_boss_phase2 = false
	_boss_phase2_timer = 0.0
	_boss_pause = false
	_boss_pause_done = false
	_was_above_zero = false
	_active = true
	visible = true
	GameState.set_player_locked(true)
	_update_ui()
	AudioManager.play_minigame_bgm(cfg.is_boss)
	AudioManager.play_sfx("press")


func _process(delta: float) -> void:
	if not _active or _config == null:
		return
	if _boss_pause:
		return

	_started = true
	var decay := _config.decay_per_sec
	if _boss_phase2:
		decay *= BOSS_PHASE2_DECAY_MULT
		_boss_phase2_timer -= delta
		if _boss_phase2_timer <= 0.0:
			_boss_phase2 = false

	if Input.is_action_just_pressed("interact"):
		var gain := _config.press_gain * GameState.get_press_gain_multiplier()
		_progress += gain
		_bar_y_offset = -4.0
		AudioManager.play_sfx("press")

	_progress -= decay * delta
	_progress = clampf(_progress, 0.0, 100.0)
	if _progress > 0.0:
		_was_above_zero = true
	_bar_y_offset = move_toward(_bar_y_offset, 0.0, 20.0 * delta)

	if _config.time_limit_sec > 0.0:
		_time_left -= delta
		if _time_left <= 0.0:
			_fail("Czas minął! Sztanga cię przygniotła.")
			return

	if _config.is_boss and not _boss_pause_done and _progress >= 50.0:
		_trigger_boss_pause()
		return

	if _progress >= 100.0:
		_success()
		return

	if _started and _was_above_zero and _progress <= 0.0:
		_fail("Sztanga spadła na klatę. Następnym razem spamuj mocniej!")
		return

	_update_ui()


func _trigger_boss_pause() -> void:
	_boss_pause = true
	_boss_pause_done = true
	GameState.set_player_locked(true)
	DialogueManager.start_dynamic("BOSS 140kg", [
		"Twoje ręce już płaczą.",
		"Ale sztanga też ma dość.",
		"FINALNA SERIA!",
	], _on_boss_pause_done)


func _on_boss_pause_done() -> void:
	_boss_pause = false
	_boss_phase2 = true
	_boss_phase2_timer = BOSS_PHASE2_DURATION


func _success() -> void:
	_active = false
	visible = false
	AudioManager.play_sfx("success")
	AudioManager.stop_minigame_bgm()
	var completed := _config.weight_kg
	GameState.unlock_next_weight(completed)
	SaveManager.save_game()
	var lines := ["Udało się! %d kg w bagażu historii." % completed]
	if completed == 140:
		lines = ["140 KG! JESTEŚ PAKEREM KUJOREM!", "Golden Gym składa hołd."]
	DialogueManager.start_dynamic("Trener", lines, func(): GameState.set_player_locked(false))


func _fail(reason: String) -> void:
	_active = false
	visible = false
	AudioManager.play_sfx("fail")
	AudioManager.stop_minigame_bgm()
	DialogueManager.start_dynamic("Trener", [reason, "Spróbuj jeszcze raz."], func(): GameState.set_player_locked(false))


func _get_config(weight_kg: int) -> WeightConfig:
	if weight_database == null:
		return null
	for cfg in weight_database.weights:
		if cfg.weight_kg == weight_kg:
			return cfg
	return null


func _update_ui() -> void:
	if _config == null:
		return
	weight_label.text = _config.label
	progress_bar.value = _progress
	var reps := int(_progress / 25.0)
	rep_label.text = "Rep: %d / 4" % mini(reps, 4)
	if _config.time_limit_sec > 0.0:
		timer_label.text = "Czas: %.0f s" % maxf(_time_left, 0.0)
		timer_label.visible = true
	else:
		timer_label.visible = false
	if _boss_phase2:
		hint_label.text = "BOSS FAZA 2! SPAMUJ!"
	else:
		hint_label.text = "Mash Z / Space!"
	bar_visual.position.y = _bar_y_offset

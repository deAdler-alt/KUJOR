extends Node2D

@onready var player: CharacterBody2D = $Player
@onready var pause_menu: Control = $UI/PauseMenu
@onready var weight_hud: Label = $UI/Hud/WeightHud
@onready var credits_label: Label = $UI/Hud/CreditsLabel


func _ready() -> void:
	if player:
		player.global_position = GameState.player_position
	GameState.weight_unlocked.connect(_on_weight_unlocked)
	GameState.flag_changed.connect(_on_flag_changed)


func enter_room() -> void:
	AudioManager.play_basement_bgm()
	if player:
		player.global_position = GameState.player_position
	_refresh_collectibles()
	_update_hud()
	if GameState.has_flag("beat_140"):
		_show_credits()


func _refresh_collectibles() -> void:
	for node in $Interactables.get_children():
		if node.has_method("refresh_from_state"):
			node.refresh_from_state()


func _on_weight_unlocked(_w: int) -> void:
	_update_hud()


func _on_flag_changed(flag: String, value: bool) -> void:
	if flag == "beat_140" and value:
		_show_credits()


func _update_hud() -> void:
	if weight_hud:
		var chalk := " | Chalk +10%" if GameState.has_item("chalk") else ""
		weight_hud.text = "Max: %d kg | F5 zapis%s" % [GameState.max_weight_unlocked, chalk]


func _show_credits() -> void:
	if credits_label:
		credits_label.visible = true
		credits_label.text = "PAKER KUJOR\nGolden Gym × Undertale\nDzięki za grę!"


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("quick_save"):
		SaveManager.save_game()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_cancel"):
		if pause_menu:
			pause_menu.toggle()
			get_viewport().set_input_as_handled()

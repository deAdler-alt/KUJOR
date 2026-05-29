extends Control

@onready var panel: PanelContainer = $Panel
@onready var save_btn: Button = $Panel/Margin/VBox/SaveBtn
@onready var load_btn: Button = $Panel/Margin/VBox/LoadBtn
@onready var resume_btn: Button = $Panel/Margin/VBox/ResumeBtn
@onready var quit_btn: Button = $Panel/Margin/VBox/QuitBtn


func _ready() -> void:
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	save_btn.pressed.connect(_on_save)
	load_btn.pressed.connect(_on_load)
	resume_btn.pressed.connect(_on_resume)
	quit_btn.pressed.connect(_on_quit)


func toggle() -> void:
	visible = not visible
	get_tree().paused = visible
	if visible:
		GameState.set_player_locked(true)
	else:
		GameState.set_player_locked(false)


func _on_save() -> void:
	SaveManager.save_game()
	resume_btn.text = "Wznow (zapisano!)"


func _on_load() -> void:
	if SaveManager.load_game():
		get_tree().paused = false
		visible = false
		get_tree().reload_current_scene()


func _on_resume() -> void:
	toggle()


func _on_quit() -> void:
	get_tree().quit()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		if visible:
			toggle()
		else:
			toggle()
		get_viewport().set_input_as_handled()

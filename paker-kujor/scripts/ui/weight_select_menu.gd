extends Control

signal weight_selected(weight_kg: int)
signal menu_closed

@onready var panel: PanelContainer = $Panel
@onready var button_container: VBoxContainer = $Panel/Margin/VBox/Buttons
@onready var title_label: Label = $Panel/Margin/VBox/Title

var _bench: Node = null
var _buttons: Array[Button] = []


func _ready() -> void:
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS


func open_menu(bench: Node) -> void:
	_bench = bench
	_rebuild_buttons()
	visible = true
	GameState.set_player_locked(true)


func close_menu() -> void:
	visible = false
	GameState.set_player_locked(false)
	menu_closed.emit()


func _rebuild_buttons() -> void:
	for btn in _buttons:
		btn.queue_free()
	_buttons.clear()
	var unlocked := GameState.get_unlocked_weights()
	title_label.text = "Wybierz wagę (max: %d kg)" % GameState.max_weight_unlocked
	for w in unlocked:
		var btn := Button.new()
		btn.text = "%d kg" % w
		if w == 140:
			btn.text = "140 kg — BOSS"
		btn.pressed.connect(_on_weight_pressed.bind(w))
		button_container.add_child(btn)
		_buttons.append(btn)
	var cancel := Button.new()
	cancel.text = "Anuluj"
	cancel.pressed.connect(close_menu)
	button_container.add_child(cancel)
	_buttons.append(cancel)


func _on_weight_pressed(weight_kg: int) -> void:
	close_menu()
	weight_selected.emit(weight_kg)
	if _bench and _bench.has_method("start_minigame"):
		_bench.start_minigame(weight_kg)


func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_action_pressed("ui_cancel"):
		close_menu()
		get_viewport().set_input_as_handled()

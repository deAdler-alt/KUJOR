extends Node

var _bgm_player: AudioStreamPlayer
var _sfx_player: AudioStreamPlayer
var _minigame_player: AudioStreamPlayer
var _music_enabled: bool = true


func _ready() -> void:
	_bgm_player = AudioStreamPlayer.new()
	_bgm_player.bus = "Master"
	_bgm_player.volume_db = -8.0
	add_child(_bgm_player)

	_minigame_player = AudioStreamPlayer.new()
	_minigame_player.bus = "Master"
	_minigame_player.volume_db = -6.0
	add_child(_minigame_player)

	_sfx_player = AudioStreamPlayer.new()
	_sfx_player.bus = "Master"
	add_child(_sfx_player)


func play_basement_bgm() -> void:
	if not _music_enabled:
		return
	_crossfade_to(_bgm_player, _load_stream("res://assets/audio/bgm_basement.wav"))


func play_minigame_bgm(is_boss: bool = false) -> void:
	if not _music_enabled:
		return
	var path := "res://assets/audio/bgm_minigame.wav"
	if is_boss:
		path = "res://assets/audio/bgm_boss.wav"
	_crossfade_to(_minigame_player, _load_stream(path))
	_bgm_player.volume_db = -20.0


func stop_minigame_bgm() -> void:
	_minigame_player.stop()
	_bgm_player.volume_db = -8.0


func play_sfx(sfx_name: String) -> void:
	var path := "res://assets/audio/%s.wav" % sfx_name
	if not ResourceLoader.exists(path):
		return
	_sfx_player.stream = load(path)
	_sfx_player.play()


func toggle_music() -> void:
	_music_enabled = not _music_enabled
	if not _music_enabled:
		_bgm_player.stop()
		_minigame_player.stop()
	else:
		play_basement_bgm()


func is_music_enabled() -> bool:
	return _music_enabled


func _crossfade_to(player: AudioStreamPlayer, stream: AudioStream) -> void:
	if stream == null:
		return
	if player.stream == stream and player.playing:
		return
	player.stream = stream
	player.play()


func _load_stream(path: String) -> AudioStream:
	if not ResourceLoader.exists(path):
		return null
	var stream: AudioStream = load(path)
	if stream is AudioStreamWAV:
		stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
	return stream
